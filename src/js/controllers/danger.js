app.controller('DangerController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', '$http', function($scope, $localStorage, $state, $stateParams, $timeout, $http)
	{
		var date_time = moment();
		var date = new Date();

		var transmit_json = {
			sender: {
				name: $localStorage.user.full_name,
				email: $localStorage.user.email_address,
				phone: $localStorage.user.phone_number
			},
			recipient: {
				name: null,
				email: null,
				phone: null
			},
			details: {
				type: $stateParams.type,
				danger: $stateParams.danger,
				date: date_time.format('dddd, MMMM Do, YYYY'),
				time: date_time.format('h:mm:ss A'),
				timezone: date.toString().match(/\(([A-Za-z\s].*)\)/)[1],
				gps: {
					latitude: null,
					longitude: null,
					elevation: null,
					accuracy: null
				}
			},
			device: {
				battery: phonegap.battery.level,
				network: phonegap.connectionType
			}
		};

		var dangers_text = {
			'physical-attack': 'Physical Attack',
			'verbal-attack': 'Verbal Attack',
			'car-accident': 'Car Accident',
			'fire-danger': 'Fire Danger',
			'being-followed': 'I\'m Being Followed',
			'high-risk-activity': 'High-Risk Activity',
			'feeling-unsafe': 'Feeling Unsafe',
			'completely-lost': 'Completely Lost'
		};

		var dangers_prefix = {
			'physical-attack': 'a ',
			'verbal-attack': 'a ',
			'car-accident': 'a ',
			'fire-danger': 'a ',
			'being-followed': '',
			'high-risk-activity': 'a ',
			'feeling-unsafe': '',
			'completely-lost': 'being '
		};

		var dangers_html = {
			'physical-attack': 'Physical<br/>Attack',
			'verbal-attack': 'Verbal<br/>Attack',
			'car-accident': 'Car<br/>Accident',
			'fire-danger': 'Fire<br/>Danger',
			'being-followed': 'I\'m Being<br/>Followed',
			'high-risk-activity': 'High-Risk<br/>Activity',
			'feeling-unsafe': 'Feeling<br/>Unsafe',
			'completely-lost': 'Completely<br/>Lost'
		};

		var types = {
			'immediate': 'Immediate Danger',
			'potential': 'Potential Danger'
		};

		$scope.type = $stateParams.type;
		$scope.danger = $stateParams.danger;
		$scope.status = $stateParams.status;
		$scope.showLoading = true;

		$scope.type_text = types[$stateParams.type];
		$scope.danger_text = dangers_text[$stateParams.danger];
		$scope.danger_html = dangers_html[$stateParams.danger];

		var getLocation = function(){

			var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };

			navigator.geolocation.getCurrentPosition(function(position){

				transmit_json.details.gps = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					altitude: position.coords.altitude,
					accuracy: position.coords.accuracy,
					altitudeAccuracy: position.coords.altitudeAccuracy,
					heading: position.coords.heading,
					speed: position.coords.speed,
					timestamp: position.timestamp
				};

				notifiyContacts();

			}, function(){

				phonegap.notification.alert(
					'We were not able to detect your location.',
					function(){
						getToken();
					},
					'Unknown Location',
					'OK'
				);

			}, options);
		};

		var notifiyContacts = function()
		{
			sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){

				// make contacts an array if its not already
				if(typeof contacts.id !== 'undefined')
				{
					contacts = [contacts];
				}

				$scope.$apply(function(){
					$scope.contacts = contacts;
					$scope.showLoading = false;
				});

				for(var i=0; i<contacts.length; i++)
				{
					transmit_json.recipient = {
						name: contacts[i].full_name,
						email: contacts[i].email_address,
						phone: contacts[i].phone_number
					};

					getToken(contacts[i]);
				}
			});
		};

		var getToken = function(user)
		{
			var url_hash = encrypt($localStorage.settings.security.encryption_key, JSON.stringify(transmit_json));
			var api = $localStorage.settings.app.prod.api.url + '?api=' + $localStorage.settings.app.prod.api.key;

			$http.jsonp(api + '&callback=JSON_CALLBACK&url=https://i.panic.press/help?hash='+url_hash).success(function(response){
				handleToken(user, response);
			});
		};

		var handleToken = function(user, response)
		{
			var status = (response.error == 0) ? 'sending' : 'error';

			sqlite.query(
				'INSERT OR REPLACE INTO panic_history (short_url, status) VALUES (?, ?)',
				[
					response.short,
					status
				],
				function()
				{
					var message_subject = "[ Panic Press ] " + transmit_json.sender.name + " Needs Help";
					var message_text = user.first_name + ",\n\n" + transmit_json.sender.name + " has indicated they are in " + types[$stateParams.type] + " from " + dangers_prefix[$stateParams.danger] + dangers_text[$stateParams.danger] + ". Please, Immediately Visit: " + response.short + "\n\n- Panic Press";
					var message_html = user.first_name + ",<br/><br/>" + transmit_json.sender.name + " has indicated they are in " + types[$stateParams.type] + " from " + dangers_prefix[$stateParams.danger] + dangers_text[$stateParams.danger] + ". Please, Immediately Visit: " + response.short + "<br/><br/>- Panic Press";

					// Send contact an email
					if(user.email_address && typeof sendgrid !== 'undefined')
					{
						var email = {
							to: user.email_address,
							from: "noreply@panic.press",
							subject: message_subject,
							html: message_html,
							text: message_text
						};

						sendgrid.send(email, function(result){

							console.log('sendgrid', result);

							if(result.message == 'success')
							{
								sqlite.query(
									'UPDATE panic_history SET status = ? WHERE short_url = ?',
									[
										'sent',
										response.short
									],
									function()
									{
										$('.contact-'+ user.id +' i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
										$('.contact-'+ user.id +' span').text('sent').removeClass('label-warning').addClass('label-info');
									}
								);
							}

						}, function(error){

							console.log('sendgrid', error);

							$('.contact-'+ user.id +' i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-times text-red');
							$('.contact-'+ user.id +' span').text('error').removeClass('label-warning').addClass('label-danger');

						});
					}

					// Send contact a text message
					if(user.phone_number)
					{
						var twilio_json = {
							message: user.first_name + ", " + transmit_json.sender.name + " has indicated they are in " + types[$stateParams.type] + " from " + dangers_prefix[$stateParams.danger] + dangers_text[$stateParams.danger] + ". Please, Immediately Visit: " + response.short,
							number: user.phone_number
						};

						var twilio_hash = encrypt($localStorage.settings.security.encryption_key, JSON.stringify(twilio_json));

						$http.jsonp('https://i.panic.press/twilio/?callback=JSON_CALLBACK&hash=' + twilio_hash).success(function(response){

							if(response.success)
							{
								console.log('SMS', 'Message Sent');

								$('.contact-'+ user.id +' i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
								$('.contact-'+ user.id +' span').text('sent').removeClass('label-warning').addClass('label-info');

							}
							else {
								console.log(response.message);

								$('.contact-'+ user.id +' i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-times text-red');
								$('.contact-'+ user.id +' span').text('error').removeClass('label-warning').addClass('label-danger');
							}
						});
					}
				}
			);
		};

		getLocation();

		/*
		if ($scope.status == 'send')
		{
			$timeout(function ()
			{
				$('.contact-1 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
				$('.contact-1 span').text('sent').removeClass('label-warning').addClass('label-info');
			}, 3000);

			$timeout(function ()
			{
				$('.contact-2 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
				$('.contact-2 span').text('sent').removeClass('label-warning').addClass('label-info');
			}, 4000);

			$timeout(function ()
			{
				$('.contact-3 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-times text-red');
				$('.contact-3 span').text('error').removeClass('label-warning').addClass('label-danger');
			}, 5000);

			$timeout(function ()
			{
				$('.contact-1 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
				$('.contact-1 span').text('read').removeClass('label-warning label-info').addClass('label-success');
			}, 10000);

			$timeout(function ()
			{
				$('.contact-2 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
				$('.contact-2 span').text('read').removeClass('label-warning label-info').addClass('label-success');
			}, 15000);
		}
		else if ($scope.status == 'sent')
		{
			$timeout(function ()
			{
				$('.contact-1 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
				$('.contact-1 span').text('read').removeClass('label-warning label-info').addClass('label-success');

				$('.contact-2 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
				$('.contact-2 span').text('read').removeClass('label-warning label-info').addClass('label-success');

				$('.contact-3 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-times text-red');
				$('.contact-3 span').text('error').removeClass('label-warning').addClass('label-danger');

			}, 0);
		}
		*/
	}
]);