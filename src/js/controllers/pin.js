app.controller('PinController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', '$window', '$http', function($scope, $localStorage, $state, $stateParams, $timeout, $window, $http)
	{
		phonegap.stats.event('App', 'Page', 'Security PIN Verification');

		/**
		 * @todo: Update SQLite to record when Danger cleared & how ( real / fake )
		 */

		$scope.type = $stateParams.type;
		$scope.danger = $stateParams.danger;
		$scope.status = $stateParams.status;

		$scope.type_text = types[$stateParams.type];
		$scope.danger_text = dangers_text[$stateParams.danger];
		$scope.danger_html = dangers_html[$stateParams.danger];

		$scope.allClear = null;
		$scope.pinInvalid = null
		$scope.pin = {
			securityPin1: null,
			securityPin2: null,
			securityPin3: null,
			securityPin4: null
		};

		$scope.initSafe = function(){
			if( !angular.isDefined($localStorage.user) || !angular.isDefined($localStorage.danger))
			{
				$state.go('app.welcome');
				return false;
			}
		};

		$scope.advance = function(name, id)
		{
			if($('#' + name + '' + id).val() != ''){
				$('#' + name + '' + (id+1)).focus();
			}
			else if($('#' + name + '' + id).val() == '' && $('#' + name + '' + (id-1)).val() != ''){
				$('#' + name + '' + (id-1)).focus();
			}
		};

		$scope.safe = function()
		{
			$window.scrollTo(0, 0);

			$('input.pin').removeClass('error');
			$scope.pinInvalid = null;
			$scope.allClear = null;

			var entered_pin = $scope.pin.securityPin1 + '' + $scope.pin.securityPin2 + '' + $scope.pin.securityPin3 + '' + $scope.pin.securityPin4;

			// Check for Valid Security PIN
			if(entered_pin === $localStorage.user.security_pin)
			{
				phonegap.stats.event('PIN', 'Security PIN Entered', 'Valid Security PIN Entered. Clearing Danger.');

				$scope.allClear = "You are no longer in danger.";

				delete $localStorage.danger;

				$scope.clearDangerNotice();

				$timeout(function(){
					$state.go('app.home');
				}, 5000);

				return false;
			}
			// Check for Valid Fake Security PIN
			else if(entered_pin === $localStorage.user.fake_security_pin)
			{
				phonegap.stats.event('PIN', 'Fake Security PIN Entered', 'Fake Security PIN Entered. Clearing Danger & Notifying Emergency Contacts.');

				$scope.allClear = "Security PIN Understood";

				delete $localStorage.danger;

				$scope.clearDangerNotice(true);

				$timeout(function(){
					$state.go('app.home');
				}, 5000);

				return false;
			}
			// User entered a PIN we don't recognize
			else if(entered_pin.length == 4)
			{
				phonegap.stats.event('PIN', 'Invalid Security PIN', 'Neither a Real of Fake Security PIN were entered.');

				$scope.pinInvalid = 'Incorrect PIN';
				return false;
			}
			// User did not finish entering PIN
			else
			{
				phonegap.stats.event('PIN', 'Security PIN Incomplete', 'User did not finish entering PIN.');
			}

			if($scope.pin.securityPin1 == null)
			{
				$('#securityPin1').addClass('error');
			}
			if($scope.pin.securityPin2 == null)
			{
				$('#securityPin2').addClass('error');
			}
			if($scope.pin.securityPin3 == null)
			{
				$('#securityPin3').addClass('error');
			}
			if($scope.pin.securityPin4 == null)
			{
				$('#securityPin4').addClass('error');
			}
		};

		$scope.clearDangerNotice = function(forced)
		{
			if(forced)
			{
				phonegap.stats.event('Danger Cleared', 'Forced to Clear Danger', 'User was forced to provide a Security PIN and entered their fake one.');
			}
			else
			{
				phonegap.stats.event('Danger Cleared', 'Willingly Cleared Danger', 'User provided their Real Security PIN to clear danger.');
			}

			sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){

				// check if we have no contacts
				if(contacts.empty)
				{
					contacts = [];
				}

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
					var user = contacts[i];
					var message_subject, message_text, message_html;

					/*
					name: $localStorage.user.full_name,
					email: $localStorage.user.email_address,
					phone: $localStorage.user.phone_number
					*/

					if(forced)
					{
						message_subject = "[ Panic Press ] " + $localStorage.user.full_name + " Forced to Enter PIN";
						message_text = user.first_name + ",\n\n" + $localStorage.user.full_name + " entered their Fake Security PIN, indicating they were forced to provide their Real PIN. Please Contact 911 Immediately.\n\n- Panic Press";
						message_html = user.first_name + ",<br/><br/>" + $localStorage.user.full_name + " entered their Fake Security PIN, indicating they were forced to provide their Real PIN. Please Contact 911 Immediately.<br/><br/>- Panic Press";
					}
					else
					{
						message_subject = "[ Panic Press ] " + $localStorage.user.full_name + " is OK Now";
						message_text = user.first_name + ",\n\n" + $localStorage.user.full_name + " is no longer in danger. They entered a Security PIN that only they know, so you can be assured they are OK now.\n\n- Panic Press";
						message_html = user.first_name + ",<br/><br/>" + $localStorage.user.full_name + " is no longer in danger. They entered a Security PIN that only they know, so you can be assured they are OK now.<br/><br/>- Panic Press";
					}

					// Send contact an email
					if(user.email_address && typeof sendgrid !== 'undefined')
					{
						phonegap.stats.event('Danger Cleared', 'Preparing Email Notification', 'Sending notice of change in danger.');

						var email = {
							to: user.email_address,
							toname: user.full_name,
							from: "noreply@panic.press",
							replyto: "noreply@panic.press",
							fromname: 'Panic Press',
							subject: message_subject,
							html: message_html,
							text: message_text
						};

						sendgrid.send(email, function(sendgrid){

							if(sendgrid.message == 'success')
							{
								phonegap.stats.event('Danger Cleared', 'Sendgrid Success', 'Successfully Sent Email');

								var cleared = (forced) ? 'by-force' : 'willingly';

								sqlite.query(
									'INSERT OR REPLACE INTO panic_press_notifications (short_url, type, danger, status, message_sent, transmit_json, sent_to, confirmed_sent_date) VALUES (?, ?, ?, ?, ?, ?, ?, DateTime("now"))',
									[
										'',
										'cleared',
										cleared,
										'sent',
										message_text,
										null,
										user.email_address
									],
									function()
									{

									}
								);
							}
							else
							{
								phonegap.stats.event('Danger Cleared', 'Sendgrid Error', 'Failed to Send Email: ' + JSON.stringify(sendgrid) );
							}

						}, function(error){

							phonegap.stats.event('Danger', 'Sendgrid Error', 'Failed to Send Email: ' + JSON.stringify(error) );

						});
					}

					// Send contact a text message
					if(user.phone_number)
					{
						phonegap.stats.event('Danger Cleared', 'Preparing Text Message Notification', 'Sending notice of change in danger.');

						var twilio_json = {};

						if(forced)
						{
							twilio_json = {
								message: " [ Panic Press ] " + $localStorage.user.full_name + " entered their Fake Security PIN, indicating they were forced to provide their Real PIN. Please Contact 911 Immediately.",
								number: user.phone_number.replace(/\D/g, '')
							};
						}
						else
						{
							twilio_json = {
								message: " [ Panic Press ] " + $localStorage.user.full_name + " is no longer in danger. They entered a Security PIN that only they know, so you can be assured they are OK now.",
								number: user.phone_number.replace(/\D/g, '')
							};
						}

						var twilio_hash = encrypt($localStorage.settings.security.encryption_key, JSON.stringify(twilio_json));

						$http.jsonp('https://i.panic.press/twilio/?callback=JSON_CALLBACK&hash=' + twilio_hash).success(function(twilio){

							if(twilio.success)
							{
								phonegap.stats.event('Danger Cleared', 'Twilio Success', 'Successfully Sent Text Message');

								var cleared = (forced) ? 'by-force' : 'willingly';

								sqlite.query(
									'INSERT OR REPLACE INTO panic_press_notifications (short_url, type, danger, status, message_sent, transmit_json, sent_to, confirmed_sent_date) VALUES (?, ?, ?, ?, ?, ?, ?, DateTime("now"))',
									[
										'',
										'cleared',
										cleared,
										'sent',
										message_text,
										null,
										user.email_address
									],
									function()
									{

									}
								);
							}
							else
							{
								phonegap.stats.event('Danger Cleared', 'Twilio Error', 'Failed to Send Text Message: ' + JSON.stringify(twilio) );
							}
						});
					}
				}
			});
		};
	}
]);