app.controller('ContactsController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}

		$scope.maxContacts = 5;
		$scope.remainingContacts = 5;
		$scope.contacts = null;
		$scope.selectedContact = null;

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

				$scope.$apply(function(){
					$scope.selectedContact = null;
					$scope.contacts = contacts;
					$scope.remainingContacts = ( $scope.maxContacts - contacts.length );
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
						phone_number,
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
				"Remove Emergency Contact ?",
				['Cancel', 'Remove Emergency Contact']
			);
		};
	}
]);