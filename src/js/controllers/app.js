app.controller('AppController', [
	'$scope', '$localStorage', '$state', '$http', function($scope, $localStorage, $state, $http)
	{
		// Application Variables
		$scope.appMode = 'setup';
		$scope.rateAppReminder = (angular.isDefined($localStorage.rateAppReminder))
			? $localStorage.rateAppReminder
			: 0;

		$scope.settings = (angular.isDefined($localStorage.settings))
			? $localStorage.settings
			: {};

		// Contact Settings
		$scope.maxContacts = 3;
		$scope.remainingContacts = $scope.maxContacts;

		// User Settings
		$scope.userHasContacts = false;
		$scope.contacts = [];
		$scope.user = (angular.isDefined($localStorage.user))
			? $localStorage.user
			: {};

		// Fetch App Settings
		$http.get('settings.json').success(function(data){
			$scope.settings = data;
			$localStorage.settings = data;
		});

		// Common Functions
		$scope.rateApp = function(immediatley)
		{
			if(typeof AppRate !== 'undefined')
			{
				var customLocale = {
					title: "Rate Panic Press",
					message: "If you enjoy using Panic Press, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!",
					cancelButtonLabel: "No, Thanks",
					laterButtonLabel: "Remind Me Later",
					rateButtonLabel: "Rate It Now"
				};

				AppRate.preferences.openStoreInApp = true;
				AppRate.preferences.storeAppURL.ios = $scope.settings.app.store.ios;
				AppRate.preferences.storeAppURL.android = $scope.settings.app.store.android;
				AppRate.preferences.customLocale = customLocale;
				AppRate.preferences.displayAppName = $scope.settings.app.name;
				AppRate.preferences.usesUntilPrompt = 5;
				AppRate.preferences.promptAgainForEachNewVersion = false;
				AppRate.preferences.callbacks.onButtonClicked = function(buttonIndex)
				{
					// No Thanks ( Never ask again )
					if(buttonIndex == 1)
					{
						$scope.rateAppReminder = $localStorage.rateAppReminder = -1;
					}

					// Remind Me Later
					if(buttonIndex == 2)
					{
						$scope.rateAppReminder = $localStorage.rateAppReminder = 10;
					}

					// Rate it Now ( Never ask again )
					if(buttonIndex == 3)
					{
						$scope.rateAppReminder = $localStorage.rateAppReminder = -1;
					}
				};

				if($scope.rateAppReminder == 0)
				{
					AppRate.promptForRating(immediatley);
				}
				else
				{
					$scope.rateAppReminder -= 1;
				}
			}
		};

		$scope.rateApp(false);

		$scope.openBrowser = function(url, target, loadstart, loadstop, loaderror, exit)
		{
			if( !target)
			{
				target = '_blank';
			}

			if(typeof cordova !== 'undefined' && typeof cordova.InAppBrowser !== 'undefined')
			{
				var new_window = cordova.InAppBrowser.open(url, target, 'location=no');

				if(typeof loadstart == 'function')
				{
					new_window.addEventListener('loadstart', loadstart);
				}

				if(typeof loadstop == 'function')
				{
					new_window.addEventListener('loadstop', loadstop);
				}

				if(typeof loaderror == 'function')
				{
					new_window.addEventListener('loaderror', loaderror);
				}

				if(typeof exit == 'function')
				{
					new_window.addEventListener('exit', exit);
				}
			}
			else
			{
				window.open(url, '_system');
			}
		};

		// Watch for Changes
		$scope.updateMode = function(callback)
		{
			if(angular.isDefined($localStorage.user) && angular.isDefined($localStorage.contacts))
			{
				if($localStorage.contacts.length > 0 && $localStorage.user.email_address && $localStorage.user.fake_security_pin && $localStorage.user.full_name && $localStorage.user.phone_number && $localStorage.user.security_pin)
				{
					$scope.appMode = 'ready';
				}
				else {
					$scope.appMode = 'setup';
				}
			}
			else
			{
				$scope.appMode = 'setup';
			}

			if(typeof callback == 'function')
			{
				callback();
			}
		};

		$scope.$watch('contacts', function(contacts){

			if(contacts.length > 0)
			{
				$localStorage.contacts = contacts;
				$scope.userHasContacts = (contacts.length > 0);
			}

			$scope.updateMode();
		});

		$scope.$watch('user', function(user){

			if(user.full_name)
			{
				$localStorage.user = user;
			}

			$scope.updateMode();
		});

		$scope.$watch('appMode', function(mode){

			console.log('mode:', mode);
		});

		// Fetch User Details
		sqlite.query('SELECT * FROM panic_user_details WHERE device_id = ?', [$localStorage.device.uuid], function(user){

			$scope.$apply(function(){

				$scope.user = {
					email_address: user.email_address,
					fake_security_pin: user.fake_security_pin,
					full_name: user.full_name,
					phone_number: user.phone_number,
					profile_picture_url: user.profile_picture_url,
					security_pin: user.security_pin
				};

				if(user.full_name)
				{
					$localStorage.user = $scope.user;
				}
			});
		});

		// Fetch User Contacts
		sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){
			if(contacts.length > 0)
			{
				$scope.$apply(function(){
					$scope.userHasContacts = true;
				});
			}

			// make contacts an array if its not already
			if(typeof contacts.id !== 'undefined')
			{
				contacts = [contacts];
				$localStorage.contacts = contacts;
				$scope.contacts = contacts;
			}
		});
	}
]);