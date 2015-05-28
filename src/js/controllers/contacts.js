app.controller('ContactsController', [
	'$scope', '$localStorage', '$state', '$timeout', '$window', '$http', function($scope, $localStorage, $state, $timeout, $window, $http)
	{
		phonegap.stats.event('App', 'Page', 'Contacts');

		if( !angular.isDefined($localStorage.user))
		{
			phonegap.stats.event('App', 'Invalid Access', 'Tried to load Contacts without a User Account');

			$state.go('app.welcome');
			return false;
		}

		var transmit_json = {
			verify: {
				type: null,
				info: null,
				name: null
			},
			sender: {
				name: $localStorage.user.full_name,
				email: $localStorage.user.email_address,
				phone: $localStorage.user.phone_number
			}
		};

		var notifyContact = function(contact_type, contact_info, full_name)
		{
			transmit_json.verify.type = contact_type;
			transmit_json.verify.info = contact_info;
			transmit_json.verify.name = full_name;

			var name_parts = full_name.split(' ');
			var first_name = name_parts[0];
			var last_name = name_parts[name_parts.length-1];

			var url_hash = encrypt($localStorage.settings.security.encryption_key, JSON.stringify(transmit_json));
			var api = $localStorage.settings.app.production.api.url + '?api=' + $localStorage.settings.app.production.api.key;

			$http.jsonp(api + '&callback=JSON_CALLBACK&url=https://i.panic.press/help/verify/?hash='+url_hash).success(function(api_response){

				console.log(contact_type, contact_info, api_response);

				var message_subject = "[ Panic Press ] Emergency Contact Request";
				var message_text = "Greetings " + first_name + ",\n\n" + transmit_json.sender.name + " has listed you as an Emergency Contact. In an emergency, you may receive notifications. \n\nTo accept: " + api_response.short + "\n\n- Panic Press";
				var message_html = "Greetings " + first_name + ",<br/><br/>" + transmit_json.sender.name + " has listed you as an Emergency Contact. In an emergency, you may receive notifications. <br/><br/>To accept:  " + api_response.short + "<br/><br/>- Panic Press";

				if(contact_type == 'email')
				{
					// Send contact an email
					if(typeof sendgrid !== 'undefined')
					{
						var email = {
							to: contact_info,
							toname: full_name,
							from: "noreply@panic.press",
							replyto: "noreply@panic.press",
							fromname: 'Panic Press',
							subject: message_subject,
							html: message_html,
							text: message_text
						};

						phonegap.stats.event('Contact', 'Verification Email', 'Sending Verification Email');

						sendgrid.send(email, function(sendgrid){

							var status = (sendgrid.message == 'success') ? 'sent' : 'failed';

							sqlite.query(
								'INSERT OR REPLACE INTO panic_press_notifications (short_url, type, danger, status, message_sent, transmit_json, sent_to, confirmed_sent_date, confirmed_sent_date) VALUES (?, ?, ?, ?, ?, ?, ?, DateTime("now"), NULL)',
								[
									api_response.short,
									'verification',
									'none',
									status,
									message_text,
									JSON.stringify(transmit_json),
									contact_info
								],
								function()
								{
									$scope.checkNotifications(1000);
								}
							);

							if(status == 'failed')
							{
								phonegap.notification.alert(
									'We were not able to send a verification email to ' + contact_info + '. We will not be able send notifications to this Email Address.',
									function(){},
									'Unable to Send Email',
									'OK'
								);

								phonegap.stats.event('Contact', 'Verification Email Failed', 'Failed to send Verification Email: ' + JSON.stringify(sendgrid) );
							}
							else
							{
								phonegap.stats.event('Contact', 'Verification Email Success', 'Successfully sent Verification Email');
							}

						}, function(error){

							phonegap.stats.event('Contact', 'Verification Email Failed', 'Failed to send Verification Email: ' + JSON.stringify(error) );

							phonegap.notification.alert(
								'We were not able to send a verification email to ' + contact_info + '. We will not be able send notifications to this Email Address.',
								function(){},
								'Unable to Send Email',
								'OK'
							);

						});
					}
				}
				else if(contact_type == 'phone')
				{
					var twilio_json = {
						message: transmit_json.sender.name + ' has listed you as an Emergency Contact. In an emergency, you may receive notifications. To accept: ' + api_response.short,
						number: contact_info.replace(/\D/g, '')
					};

					var twilio_hash = encrypt($localStorage.settings.security.encryption_key, JSON.stringify(twilio_json));

					phonegap.stats.event('Contact', 'Verification Phone', 'Sending Verification Text Message');

					$http.jsonp('https://i.panic.press/twilio/?callback=JSON_CALLBACK&hash=' + twilio_hash).success(function(twilio){

						var status = (twilio.success) ? 'sent' : 'failed';

						sqlite.query(
							'INSERT OR REPLACE INTO panic_press_notifications (short_url, type, danger, status, message_sent, transmit_json, sent_to, confirmed_sent_date) VALUES (?, ?, ?, ?, ?, ?, ?, DateTime("now"))',
							[
								api_response.short,
								'verification',
								'none',
								status,
								twilio_json.message,
								JSON.stringify(transmit_json),
								twilio_json.number
							],
							function()
							{
								$scope.checkNotifications(1000);
							}
						);

						if(status == 'failed')
						{
							phonegap.notification.alert(
								contact_info + ' is not a number that can receive text messages. We will not be able send notifications to this number.',
								function(){},
								'Invalid Number',
								'OK'
							);

							phonegap.stats.event('Contact', 'Verification Phone Failed', 'Failed to send Verification Text Message: ' + JSON.stringify(twilio) );
						}
						else
						{
							phonegap.stats.event('Contact', 'Verification Phone Success', 'Successfully sent Verification Text Message');
						}
					});
				}
			});
		};

		$scope.modal = {
			email: null,
			phone: null
		};

		$scope.preparePickContact = function(){

			if( !angular.isDefined($localStorage.contactIntro))
			{
				phonegap.stats.event('Contact', 'Prepare Contact', 'Informing user that we will send notifications.' );

				phonegap.notification.confirm(
					"When you add an Emergency Contact, we send them an Email & Text Message asking them to accept your request. If you would like to give them a heads up before we do this, press \"Cancel\".",
					function(selection){
						if(selection == 2)
						{
							phonegap.stats.event('Contact', 'Prepare Contact Accepted', 'User accepted and will add first contact.' );
							$localStorage.contactIntro = true;
							$scope.pickContact();
						}
						else
						{
							phonegap.stats.event('Contact', 'Prepare Contact Declined', 'User declined amd will add first contact later.' );
						}
					},
					"Emergency Contact Setup",
					['Cancel', 'Add Contact']
				);
			}
			else
			{
				$scope.pickContact();
			}

		};

		$scope.pickContact = function()
		{
			phonegap.stats.event('Contact', 'Pick Contact', 'Picking Contact from Contact List');

			$scope.contactAlert = null;

			if(typeof navigator.contacts !== 'undefined')
			{
				navigator.contacts.pickContact(function(contact){

					phonegap.stats.event('Contact', 'Pick Contact Success', 'Contact Selected');

					$scope.$apply(function(){
						$scope.selectedContact = contact;
					});

					$('.contact-details').modal('show');

				}, function(err){

					phonegap.stats.event('Contact', 'Pick Contact Error', 'Failed to Select Contact: ' + JSON.stringify(err));
				});
			}
			else
			{
				phonegap.stats.event('Contact', 'Pick Contact Error', 'Unable to load Plugin');

				$('.add-contact').modal('show');
			}
		};

		$scope.addContact = function()
		{
			phonegap.stats.event('Contact', 'Add Contact', 'Adding a New Contact');

			$scope.contactAlert = null;

			if($scope.modal.email && $scope.modal.phone)
			{
				phonegap.stats.event('Contact', 'Add Contact Success', 'Added New Contact');

				var unique_id = $scope.selectedContact.rawId || Date.now();
				var email_address = $scope.modal.email;
				var phone_number = $scope.modal.phone.replace(/\D/g, '');
				var image_data = ( $scope.selectedContact.photos ) ? $scope.selectedContact.photos[0].value : '';
				var full_name = $scope.selectedContact.name.formatted;

				sqlite.query(
					'INSERT OR REPLACE INTO panic_emergency_contacts (unique_id, full_name, first_name, last_name, email_address, phone_number, image_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
					[
						unique_id,
						$scope.selectedContact.name.formatted,
						$scope.selectedContact.name.givenName,
						$scope.selectedContact.name.familyName,
						email_address,
						phone_number,
						image_data
					],
					function()
					{
						$('.contact-details').modal('hide');
						$scope.updateContacts();

						notifyContact('email', email_address, full_name);
						notifyContact('phone', phone_number, full_name);
					}
				);
			}
			else
			{
				phonegap.stats.event('Contact', 'Add Contact Error', 'Failed to Add New Contact');

				$scope.contactAlert = 'Both Email & Phone Required';
				return false;
			}
		};

		$scope.addManualContact = function()
		{
			phonegap.stats.event('Contact', 'Manual Contact', 'Manually Adding New Contact');

			var $name = $('#name');
			var $email = $('#email');
			var $phone = $('#phone');

			var name = title_case($name.val());
			var email = $email.val().trim();
			var phone = $phone.val().trim();

			$scope.detailsAlert = null;

			$('.has-error').removeClass('has-error');

			var valid_full_name = /^[a-zA-Z-'. ]+ [a-zA-Z-'. ]+$/;
			var valid_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			var valid_phone = /^\d{10}$/g;

			if(name.length == 0)
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Missing Name');

				$scope.detailsAlert = 'Enter your Full Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if( !valid_full_name.test(name))
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Invalid Name');

				$scope.detailsAlert = 'Enter an Valid Full Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if(email.length == 0)
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Missing Email');

				$scope.detailsAlert = 'Enter an Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if( !valid_email.test(email))
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Invalid Email');

				$scope.detailsAlert = 'Enter a Valid Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if(phone.length == 0)
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Missing Phone Number');

				$scope.detailsAlert = 'Enter an Phone Number';
				$phone.parent().addClass('has-error');
				$phone.focus();
				return false;
			}
			if( !valid_phone.test(phone))
			if( !valid_phone.test(phone))
			{
				phonegap.stats.event('Contact', 'Manual Contact Error', 'Invalid Phone Number');

				$scope.detailsAlert = 'Enter an Valid Phone Number';
				$phone.parent().addClass('has-error');
				$phone.focus();
				return false;
			}

			var unique_id = Date.now();
			var full_name = $scope.manual.full_name;
			var email_address = $scope.manual.email_address;
			var phone_number = $scope.manual.phone_number.replace(/\D/g, '');
			var image_data = '';

			var name_parts = full_name.split(' ');
			var first_name = name_parts[0];
			var last_name = name_parts[name_parts.length-1];

			sqlite.query(
				'INSERT OR REPLACE INTO panic_emergency_contacts (unique_id, full_name, first_name, last_name, email_address, phone_number, image_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[
					unique_id,
					full_name,
					first_name,
					last_name,
					email_address,
					phone_number,
					image_data
				],
				function()
				{
					phonegap.stats.event('Contact', 'Manual Contact Success', 'Added New Contact');

					$('.add-contact').modal('hide');
					$scope.updateContacts();

					notifyContact('email', email_address, full_name);
					notifyContact('phone', phone_number, full_name);
				}
			);
		};

		$scope.removeContact = function(contact_id)
		{
			phonegap.stats.event('Contact', 'Remove Contact', 'Removing Contact');

			phonegap.notification.confirm(
				"Are you sure you want to remove this Emergency Contact? This cannot be undone.",
				function(results){
					if(results == 2 && contact_id)
					{
						sqlite.query(
							'DELETE FROM panic_emergency_contacts WHERE id = ?',
							[
								contact_id
							],
							function()
							{
								phonegap.stats.event('Contact', 'Remove Contact Success', 'Contact Removed');

								$scope.updateContacts();
							}
						);
					}
					else
					{
						phonegap.stats.event('Contact', 'Remove Contact Error', 'User Opted not to Remove Contact');
					}
				},
				"Emergency Contact",
				['Cancel', 'Remove']
			);
		};
	}
]);