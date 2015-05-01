app.controller('AppController', [
	'$scope', '$localStorage', '$state', '$http', '$window', function($scope, $localStorage, $state, $http, $window)
	{
		// Check if user is in danger and redirect if they are
		if(angular.isDefined($localStorage.danger) && $scope.currentPage !== 'app.danger' && $scope.currentPage !== 'app.pin')
		{
			$state.go('app.danger', {
				type: $localStorage.danger.type,
				danger: $localStorage.danger.danger,
				status: 'sent'
			});
		}

		// Application Variables
		$scope.appMode = (angular.isDefined($localStorage.appMode))
			? $localStorage.appMode
			: 'setup';

		$scope.rateAppReminder = (angular.isDefined($localStorage.rateAppReminder))
			? $localStorage.rateAppReminder
			: 0;

		$scope.updateAppReminder = (angular.isDefined($localStorage.updateAppReminder))
			? $localStorage.updateAppReminder
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

			data.app.version = $scope.app.version;

			$window.settings = data;
			$scope.settings = data;
			$localStorage.settings = data;
		});

		// Check for new version
		$http.get('https://i.panic.press/mobile_app_info.json').success(function(mobile_app_info){

			var include_beta = ($scope.settings.app.environment == 'development');
			var app_difference = compare_app_versions($scope.app.version, mobile_app_info, include_beta);

			// New Version Available
			if(app_difference > 0 )
			{
				// User not notified of new version
				if($scope.updateAppReminder == 0)
				{
					phonegap.stats.event('App', 'Update Available', 'User on v' + $scope.app.version + '. Latest is v' + mobile_app_info.current_version );

					phonegap.notification.confirm(
						"You are currently using an outdated version of Panic Press. The current version is " + mobile_app_info.current_version + ". Would you like to Update Panic Press?",
						function(selection){
							if(selection == 2)
							{
								if(device.platform.toLowerCase() == 'ios' && include_beta)
								{
									phonegap.stats.event('App', 'Update Available Accepted', 'Updating to iOS Beta Version ' + mobile_app_info.current_version );

									$scope.openBrowser(mobile_app_info.link.beta.ios);
								}
								else if(device.platform.toLowerCase() == 'ios' && !include_beta)
								{
									phonegap.stats.event('App', 'Update Available Accepted', 'Updating to iOS Version ' + mobile_app_info.current_version );

									$scope.openBrowser(mobile_app_info.link.production.ios);
								}
								else if (device.platform.toLowerCase() == 'android' && include_beta)
								{
									phonegap.stats.event('App', 'Update Available Accepted', 'Updating to Android Beta Version ' + mobile_app_info.current_version );

									$scope.openBrowser(mobile_app_info.link.beta.android);
								}
								else if (device.platform.toLowerCase() == 'android' && !include_beta)
								{
									phonegap.stats.event('App', 'Update Available Accepted', 'Updating to Android Version ' + mobile_app_info.current_version );

									$scope.openBrowser(mobile_app_info.link.production.android);
								}
							}
							else
							{
								phonegap.stats.event('App', 'Update Available Declined', 'User declined Update to Version ' + mobile_app_info.current_version );
							}
						},
						"Update Panic Press ?",
						['Not Now', 'Get Update']
					);
				}
				// User opted not to update
				else
				{
					phonegap.stats.event('App', 'Update Available Skipped', 'Will ask user again after ' + ( 5 - $scope.updateAppReminder ) + ' notice(s).' );
				}

				$scope.updateAppReminder += 1;
			}
		});

		$scope.swipe = function(direction)
		{
			console.log(direction);
		};

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

		$scope.getMode = function(callback)
		{
			if(typeof callback == 'function')
			{
				callback($scope.appMode);
			}
			else
			{
				return $scope.appMode;
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

		// Store Mode
		$scope.$watch('appMode', function(mode){
			$localStorage.appMode = mode;
		});

		$scope.$watch('updateAppReminder', function(count){

			// Reset notification after 5 dismissals
			if(count >= 5)
			{
				count = 0;
			}

			$localStorage.updateAppReminder = count;
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