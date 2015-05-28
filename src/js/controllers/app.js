app.controller('AppController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$http', '$window', '$timeout', function($scope, $localStorage, $state, $stateParams, $http, $window, $timeout)
	{
		// Check if user is in danger and redirect if they are
		if(angular.isDefined($localStorage.danger) && $scope.currentPage !== 'app.danger' && $scope.currentPage !== 'app.pin')
		{
			$state.go('app.danger', {
				type: $localStorage.danger.type,
				danger: $localStorage.danger.danger,
				status: 'sent'
			});

			return false;
		}

		/**
		 * --------------------------------------------------
		 * Scope Variables
		 * --------------------------------------------------
		 */

		// Application Variables
		$scope.appMode = (angular.isDefined($localStorage.appMode)) ? $localStorage.appMode : 'setup';
		$scope.updateAppReminder = (angular.isDefined($localStorage.updateAppReminder)) ? $localStorage.updateAppReminder : 0;
		$scope.settings = (angular.isDefined($localStorage.settings)) ? $localStorage.settings : {};
		$scope.notifications = (angular.isDefined($localStorage.notifications)) ? $localStorage.notifications : {};
		$scope.timeout = null;

		// Contact Settings
		$scope.maxContacts = 1;
		$scope.remainingContacts = $scope.maxContacts;
		$scope.selectedContact = null;
		$scope.remainingMessage = ($scope.remainingContacts == 1) ? 'Contact Remaining' : 'Contacts Remaining';
		$scope.checkForNotifications = true;
		$scope.checkInterval = 5000;
		$scope.checker = 5000;

		// User Settings
		$scope.userHasContacts = false;
		$scope.contacts = [];
		$scope.user = (angular.isDefined($localStorage.user)) ? $localStorage.user : {};

		/**
		 * --------------------------------------------------
		 * Scope Functions
		 * --------------------------------------------------
		 */

		/**
		 * Initialize Application
		 */
		$scope.init = function()
		{
			/**
			 * --------------------------------------------------
			 * Fetch Remote Settings
			 * --------------------------------------------------
			 */
			// Fetch App Settings
			$http.get('settings.json').success(function(data){
				$window.settings = data;
				$scope.settings = data;
				$localStorage.settings = data;
			});

			$http.get('package.json').success(function(data){
				$window.package = data;
				$scope.package = data;
				$localStorage.package = data;

				if(typeof data.version !== 'undefined')
				{
					$scope.checkForUpdate(data.version);
				}
			});

			// Check for Purchases
			$scope.checkPurchases();

			// Check for Notification Updates
			$scope.checkNotifications();

			// Fetch User Details
			sqlite.query('SELECT * FROM panic_user_details WHERE device_id = ?', [$localStorage.device.uuid], function(user){

				// check if we have no users
				if(user.empty)
				{
					return false;
				}

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

				// check if we have no contacts
				if(contacts.empty)
				{
					contacts = [];
				}

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

		};

		$scope.checkForUpdate = function(installed_version){
			// Check for New Version
			$http.get('https://i.panic.press/mobile_app_info.json').success(function(mobile_app_info){

				var include_beta = ($scope.settings.app.environment == 'development');
				var app_difference = compare_app_versions(installed_version, mobile_app_info, include_beta);

				// New Version Available
				if(app_difference > 0 )
				{
					// User not notified of new version
					if($scope.updateAppReminder == 0)
					{
						phonegap.stats.event('App', 'Update Available', 'User on v' + $scope.package.version + '. Latest is v' + mobile_app_info.current_version );

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
		};

		/**
		 * Ask User to Approve GPS access
		 */
		$scope.approveGPS = function()
		{
			$localStorage.approvedGPS = true;

			phonegap.stats.event('App', 'Approve GPS', 'Requesting GPS Access');

			phonegap.notification.confirm(
				"Panic Press needs permission to access your GPS location.",
				function(selection){
					if(selection == 2 && typeof navigator.geolocation !== 'undefined')
					{
						var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };

						navigator.geolocation.getCurrentPosition(function(position){

							phonegap.stats.event('App', 'Approve GPS Accepted', 'Approved in: ' + position.coords.latitude + ',' + position.coords.longitude);

						}, function(){

							phonegap.stats.event('App', 'Approve GPS Accepted', 'Unable to obtain location Information');

						}, options);
					}
					else
					{
						phonegap.stats.event('App', 'Approve GPS Declined', 'User declined access to GPS' );

						phonegap.notification.center('Setup Incomplete', 'Panic Press needs permission to access your GPS location.');
					}
				},
				"Requesting GPS Access",
				['Not Now', 'Allow GPS']
			);
		};

		/**
		 * Update Emergency Contacts
		 */
		$scope.updateContacts = function()
		{
			phonegap.stats.event('Contact', 'Update Contacts', 'About to Update Contacts');

			sqlite.query('SELECT * FROM panic_emergency_contacts', [], function(contacts){

				// check if we have no contacts
				if(contacts.empty)
				{
					contacts = [];
					delete $localStorage.contacts;
				}
				// make contacts an array if its not already
				else if(typeof contacts.id !== 'undefined')
				{
					contacts = [contacts];
					$localStorage.contacts = contacts;
				}

				phonegap.stats.event('Contact', 'Update Contacts Success', 'User now has '+ contacts.length +' Contacts');

				$scope.$apply(function(){
					$scope.selectedContact = null;
					$scope.contacts = contacts;
					$scope.remainingContacts = ( $scope.maxContacts - contacts.length );
					$scope.remainingMessage = ($scope.remainingContacts == 1) ? 'Emergency Contact Remaining' : 'Emergency Contacts Remaining';

					$timeout.cancel($scope.timeout);
					$scope.timeout = $timeout($scope.updateMode, 250);
				});
			});
		};

		$scope.checkPurchases = function(){
			// Check for Store Purchases
			if(typeof $window.store !== 'undefined')
			{
				if($window.store.get('upgrade_to_5_contacts').owned)
				{
					$scope.maxContacts = 5;
					$scope.remainingContacts = $scope.maxContacts;
				}
				if($window.store.get('upgrade_to_10_contacts').owned)
				{
					$scope.maxContacts = 10;
					$scope.remainingContacts = $scope.maxContacts;
				}
			}
		};

		/**
		 * Use Cordova's InAppBrowser Plugin
		 *
		 * @param url Website to open
		 * @param target Options are _self, _blank & _system
		 * @param loadstart Callback for when browser load starts
		 * @param loadstop Callback for when browser load stops
		 * @param loaderror Callback for when browser has an error
		 * @param exit
		 */
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

		/**
		 * Get the current application mode
		 * @param callback
		 * @returns {*|string|string}
		 */
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

		/**
		 * Change the Application Mode
		 * @param callback
		 */
		$scope.updateMode = function(callback)
		{
			var is_ready = false;

			if(angular.isDefined($localStorage.user) && angular.isDefined($localStorage.contacts))
			{
				if($localStorage.contacts.length > 0 && $localStorage.user.email_address && $localStorage.user.fake_security_pin && $localStorage.user.full_name && $localStorage.user.phone_number && $localStorage.user.security_pin)
				{
					for(var i=0; i<$localStorage.contacts.length; i++)
					{
						if($localStorage.contacts[i].verified_email || $localStorage.contacts[i].verified_phone)
						{
							is_ready = true;
							break;
						}
					}
				}
			}

			var mode = (is_ready) ? 'ready' : 'setup';
			$scope.appMode = mode;

			$window.phonegap.status = mode;

			if(typeof callback == 'function')
			{
				callback(mode);
			}
			else
			{
				return mode;
			}
		};

		/**
		 * Check for Updates to Notifications we've sent with Exponential Backoff
		 */
		$scope.checkNotifications = function(checkInterval)
		{
			phonegap.stats.event('App', 'Notifications', 'Checking Notification Status' );

			if($scope.checker)
			{
				$timeout.cancel($scope.checker);
			}

			if(checkInterval)
			{
				$scope.checkForNotifications = true;
				$scope.checkInterval = checkInterval;
			}

			if($scope.checkForNotifications == false)
			{
				if($scope.checker)
				{
					$timeout.cancel($scope.checker);
				}

				phonegap.stats.event('App', 'Notifications', 'No Notifications to Check' );

				return false;
			}

			// Check for message less than an hour old
			sqlite.query('SELECT * FROM panic_press_notifications WHERE status = ? AND created_at > datetime("now", "-1 day") AND type != ?', ['sent', 'cleared'], function(notifications){

				// check if we have no notifications
				if(notifications.empty)
				{
					notifications = [];
				}
				// Convert to array if only one notification was found
				else if(typeof notifications.id !== 'undefined')
				{
					notifications = [notifications];
				}

				// Save results to local storage
				$localStorage.notifications = notifications;

				var short = null;
				var notification = {};

				// Check if we have any results
				if(notifications.length > 0)
				{
					phonegap.stats.event('App', 'Notifications', 'There are ' + notifications.length + ' that have not been received.' );

					var api = $localStorage.settings.app.production.api.url + '?api=' + $localStorage.settings.app.production.api.key;

					// Loop through results
					for(var i=0; i<notifications.length; i++)
					{
						// Just get the short code from URL
						notification = notifications[i];
						short = notification.short_url.replace('https://i.panic.press/', '');

						phonegap.stats.event('App', 'Notifications', 'Checking status of ' + short );

						// Check Status of Short Code for Clicks
						$http.jsonp(api + '&callback=JSON_CALLBACK&short=' + short).success(function(update){

							// User Visited Short Code
							if(update.click > 0)
							{
								phonegap.stats.event('App', 'Notification Received', 'Notification ' + short + ' was received.' );

								// Update Notification Status
								sqlite.query(
									'UPDATE `panic_press_notifications` SET `status` = ?, `confirmed_received_date` = DateTime("now") WHERE `short_url` = ?',
									[
										'received',
										notification.short_url
									],
									function()
									{
										// No more need to check notifications
										if(notifications.length <= 1)
										{
											phonegap.stats.event('App', 'Notification Check Complete', 'All Notifications are cleared.' );

											$scope.checkForNotifications = false;
										}
										// Some notifications were not cleared, let's recheck
										else
										{
											phonegap.stats.event('App', 'Notification Recheck Required', 'There were some notifications that were not cleared.' );

											$scope.checkForNotifications = true;
											$timeout.cancel($scope.checker);
											$scope.checker = $timeout(function(){
												$scope.checkNotifications();
											}, $scope.checkInterval);
										}
									}
								);

								// Check if this was to verify an emergency contact
								if(notification.type == 'verification')
								{
									// Update and Email Addresses found
									if(notification.sent_to.indexOf('@') > -1)
									{
										sqlite.query(
											'UPDATE `panic_emergency_contacts` SET `verified_email` = DateTime("now"), `last_modified` = DateTime("now") WHERE `email_address` = ? AND `verified_email` IS NULL',
											[
												notification.sent_to
											],
											function(results)
											{
												// Check if we found an update
												if(results.rows_affected > 0)
												{
													phonegap.stats.event('App', 'Notification Verified Email Address', 'Verified Emergency Contacts Email Address.');
													phonegap.notification.center('Email Address Verified', notification.sent_to + ' has verified this Email Address for use as an Emergency Contact.');

													$timeout.cancel($scope.timeout);
													$scope.timeout = $timeout(function(){
														$scope.updateContacts();
													}, 250);
												}
											}
										);
									}
									// Update any Phone Numbers found
									else
									{
										sqlite.query(
											'UPDATE `panic_emergency_contacts` SET `verified_phone` = DateTime("now"), `last_modified` = DateTime("now") WHERE `phone_number` = ? AND `verified_phone` IS NULL',
											[
												notification.sent_to.replace(/\D/g, '')
											],
											function(results)
											{
												// Check if we found an update
												if(results.rows_affected > 0)
												{
													phonegap.stats.event('App', 'Notification Verified Phone Number', 'Verified Emergency Contacts Phone Number.');
													phonegap.notification.center('Phone Number Verified', phone_number(notification.sent_to) + ' has verified this Phone Number for use as an Emergency Contact.');

													$timeout.cancel($scope.timeout);
													$scope.timeout = $timeout(function(){
														$scope.updateContacts();
													}, 250);
												}
											}
										);
									}
								}
							}
							else
							{
								phonegap.stats.event('App', 'Notification Not Received', 'Notification ' + short + ' was not received.' );
								phonegap.stats.event('App', 'Notification Recheck Required', 'There were some notifications that were not cleared.' );

								$scope.checkForNotifications = true;
								$timeout.cancel($scope.checker);
								$scope.checker = $timeout(function(){
									$scope.checkNotifications();
								}, $scope.checkInterval);
							}
						});
					}
				}
				else
				{
					phonegap.stats.event('App', 'Notifications', 'No Notifications Found needing Checked' );
				}
			});

			$scope.checkInterval = ($scope.checkInterval * 1.5);
		};

		/**
		 * --------------------------------------------------
		 * Watch for Scope Changes
		 * --------------------------------------------------
		 */

		// Watch for changes to Contacts
		$scope.$watch('contacts', function(contacts, old_value){

			if(contacts.length > 0)
			{
				$localStorage.contacts = contacts;
				$scope.userHasContacts = (contacts.length > 0);
			}

			$scope.$broadcast('contactsChanged', contacts);

			phonegap.stats.event('App', 'Scope Change', 'User Updated their Emergency Contacts' );

			$scope.updateMode();
		});

		// Watch for changes to User
		$scope.$watch('user', function(user, old_value){

			if(user.full_name)
			{
				$localStorage.user = user;
			}

			$scope.$broadcast('userChanged', user);

			phonegap.stats.event('App', 'Scope Change', 'User Updated their Account Details' );

			$scope.updateMode();
		});

		// Watch for changes to App Mode
		$scope.$watch('appMode', function(mode, old_value){
			$localStorage.appMode = mode;
			$scope.$broadcast('appModeChanged', mode)

			phonegap.stats.event('App', 'Scope Change', 'App Mode Changed to ' + mode );
		});

		// Watch for changes to App Reminder
		$scope.$watch('updateAppReminder', function(count, old_value){

			// Reset notification after 5 dismissals
			if(count >= 5)
			{
				count = 0;
			}

			$localStorage.updateAppReminder = count;

			$scope.$broadcast('updateAppReminderChanged', count);

			phonegap.stats.event('App', 'Scope Change', 'App Rating Reminder Changed to ' + count );
		});

		// Watch for changes to whether we should recheck notifications
		$scope.$watch('checkForNotifications', function(check, old_value){
			$scope.$broadcast('checkForNotificationsChanged', check);

			if(old_value == false && check == true)
			{
				$timeout.cancel($scope.checker);
				$scope.checkNotifications();
			}

			var bool_text = (check) ? 'True' : 'False';

			phonegap.stats.event('App', 'Scope Change', 'Check For Notifications Changed to ' + bool_text );
		});

		// Watch for changes to Notifications
		$scope.$watch('notifications', function(notifications, old_value){
			$scope.$broadcast('notificationsChanged', notifications);

			phonegap.stats.event('App', 'Scope Change', 'Notifications Changed' );
		});

	}
]);