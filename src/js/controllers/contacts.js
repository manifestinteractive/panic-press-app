app.controller('ContactsController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		/**
		 * @todo: Notify Emergency Contacts when they are added
		 * @todo: Update SQLite to store verification of Acceptance of Emergency Contact
		 * @todo: Update UI to show pending verifications
		 */

		phonegap.stats.event('App', 'Page', 'Contacts');

		if( !angular.isDefined($localStorage.user))
		{
			phonegap.stats.event('App', 'Invalid Access', 'Tried to load Contacts without a User Account');

			$state.go('app.welcome');
			return false;
		}

		$scope.selectedContact = null;
		$scope.remainingMessage = ($scope.remainingContacts == 1) ? 'Contact Remaining' : 'Contacts Remaining';
		$scope.modal = {
			email: null,
			phone: null
		};

		$scope.updateContacts = function()
		{
			phonegap.stats.event('Contact', 'Update Contacts', 'About to Update Contacts');

			sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){

				// make contacts an array if its not already
				if(typeof contacts.id !== 'undefined')
				{
					contacts = [contacts];
				}

				phonegap.stats.event('Contact', 'Update Contacts Success', 'User now has '+ contacts.length +' Contacts');

				$localStorage.contacts = contacts;

				$scope.$apply(function(){
					$scope.selectedContact = null;
					$scope.contacts = contacts;
					$scope.remainingContacts = ( $scope.maxContacts - contacts.length );
					$scope.remainingMessage = ($scope.remainingContacts == 1) ? 'Contact Remaining' : 'Contacts Remaining';

					$scope.updateMode();
				});
			});
		};

		$scope.pickContact = function()
		{
			phonegap.stats.event('Contact', 'Pick Contact', 'Picking Contact from Contact List');

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

			if($scope.modal.email || $scope.modal.phone)
			{
				phonegap.stats.event('Contact', 'Add Contact Success', 'Added New Contact');

				var unique_id = $scope.selectedContact.rawId || Date.now();
				var email_address = $scope.modal.email || '';
				var phone_number = $scope.modal.phone || '';
				var image_data = ( $scope.selectedContact.photos ) ? $scope.selectedContact.photos[0].value : '';

				sqlite.query(
					'INSERT OR REPLACE INTO panic_emergency_contacts (unique_id, full_name, first_name, last_name, email_address, phone_number, image_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
					[
						unique_id,
						$scope.selectedContact.name.formatted,
						$scope.selectedContact.name.givenName,
						$scope.selectedContact.name.familyName,
						email_address,
						phone_number.replace(/\D/g, ''),
						image_data
					],
					function()
					{
						$('.contact-details').modal('hide');
						$scope.updateContacts();
					}
				);
			}
			else
			{
				phonegap.stats.event('Contact', 'Add Contact Error', 'Failed to Add New Contact');
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
			var phone_number = $scope.manual.phone_number;
			var image_data = '';

			var name_parts = full_name.split(' ');
			var first_name = name_parts[0];
			var last_name = name_parts[name_parts.length];

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