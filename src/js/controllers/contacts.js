app.controller('ContactsController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		if( !angular.isDefined($localStorage.user))
		{
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
			sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){

				// make contacts an array if its not already
				if(typeof contacts.id !== 'undefined')
				{
					contacts = [contacts];
				}

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
			if(typeof navigator.contacts !== 'undefined')
			{
				navigator.contacts.pickContact(function(contact){

					$scope.$apply(function(){
						$scope.selectedContact = contact;
					});

					$('.contact-details').modal('show');

				}, function(err){
					console.log('Error: ' + err);
				});
			}
			else
			{
				$('.add-contact').modal('show');
			}
		};

		$scope.addContact = function()
		{
			if($scope.modal.email || $scope.modal.phone)
			{
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
		};

		$scope.addManualContact = function()
		{
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
				$scope.detailsAlert = 'Enter your Full Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if( !valid_full_name.test(name))
			{
				$scope.detailsAlert = 'Enter an Valid Full Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if(email.length == 0)
			{
				$scope.detailsAlert = 'Enter an Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if( !valid_email.test(email))
			{
				$scope.detailsAlert = 'Enter a Valid Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if(phone.length == 0)
			{
				$scope.detailsAlert = 'Enter an Phone Number';
				$phone.parent().addClass('has-error');
				$phone.focus();
				return false;
			}
			if( !valid_phone.test(phone))
			{
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
					$('.add-contact').modal('hide');
					$scope.updateContacts();
				}
			);
		};

		$scope.removeContact = function(contact_id)
		{
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
								$scope.updateContacts();
							}
						);
					}
				},
				"Emergency Contact",
				['Cancel', 'Remove']
			);
		};
	}
]);