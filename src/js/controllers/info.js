app.controller('InfoController', [
	'$scope', '$localStorage', '$state', '$stateParams', function($scope, $localStorage, $state, $stateParams)
	{
		$scope.section = $stateParams.section;

		phonegap.stats.event('App', 'Page', 'My Info: ' + title_case($stateParams.section));

		$scope.securityPin = $localStorage.securityPin || null;
		$scope.securityVerifyPin = null;
		$scope.fakePin = $localStorage.fakePin || null;
		$scope.fakeVerifyPin = null

		$scope.pin = {
			securityPin1: null,
			securityPin2: null,
			securityPin3: null,
			securityPin4: null,

			securityVerifyPin1: null,
			securityVerifyPin2: null,
			securityVerifyPin3: null,
			securityVerifyPin4: null,

			fakePin1: null,
			fakePin2: null,
			fakePin3: null,
			fakePin4: null,

			fakeVerifyPin1: null,
			fakeVerifyPin2: null,
			fakeVerifyPin3: null,
			fakeVerifyPin4: null
		};

		$scope.user = {
			email_address: null,
			fake_security_pin: null,
			full_name: null,
			phone_number: null,
			profile_picture_url: null,
			security_pin: null
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

		sqlite.query('SELECT * FROM panic_user_details WHERE device_id = ?', [$localStorage.device.uuid], function(user){

			// check if we have no user
			if(user.empty)
			{
				user = [];
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

				if(user.security_pin)
				{
					var parts = user.security_pin.split('');

					if(parts.length == 4)
					{
						$scope.pin.securityPin1 = $scope.pin.securityVerifyPin1 = parts[0];
						$scope.pin.securityPin2 = $scope.pin.securityVerifyPin2 = parts[1];
						$scope.pin.securityPin3 = $scope.pin.securityVerifyPin3 = parts[2];
						$scope.pin.securityPin4 = $scope.pin.securityVerifyPin4 = parts[3];
					}
				}

				if(user.fake_security_pin)
				{
					var fake_parts = user.fake_security_pin.split('');

					if(fake_parts.length == 4)
					{
						$scope.pin.fakePin1 = $scope.pin.fakeVerifyPin1 = fake_parts[0];
						$scope.pin.fakePin2 = $scope.pin.fakeVerifyPin2 = fake_parts[1];
						$scope.pin.fakePin3 = $scope.pin.fakeVerifyPin3 = fake_parts[2];
						$scope.pin.fakePin4 = $scope.pin.fakeVerifyPin4 = fake_parts[3];
					}
				}
			});
		});

		$scope.addUser = function()
		{
			phonegap.stats.event('My Info', 'Add Details', 'Adding Users Info');

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
				phonegap.stats.event('My Info', 'Add Details Error', 'Empty Name');

				$scope.detailsAlert = 'Enter your Full Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if( !valid_full_name.test(name))
			{
				phonegap.stats.event('My Info', 'Add Details Error', 'Invalid Name');

				$scope.detailsAlert = 'Enter a First & Last Name';
				$name.parent().addClass('has-error');
				$name.focus();
				return false;
			}
			if(email.length == 0)
			{
				phonegap.stats.event('My Info', 'Add Details Error', 'Empty Email');

				$scope.detailsAlert = 'Enter an Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if( !valid_email.test(email))
			{
				phonegap.stats.event('My Info', 'Add Details Error', 'Invalid Email');

				$scope.detailsAlert = 'Enter a Valid Email Address';
				$email.parent().addClass('has-error');
				$email.focus();
				return false;
			}
			if(phone.length == 0)
			{
				phonegap.stats.event('My Info', 'Add Details Error', 'Empty Phone Number');

				$scope.detailsAlert = 'Enter an Phone Number';
				$phone.parent().addClass('has-error');
				$phone.focus();
				return false;
			}
			if( !valid_phone.test(phone))
			{
				phonegap.stats.event('My Info', 'Add Details Error', 'Invalid Phone Number');

				$scope.detailsAlert = 'Enter an Valid Phone Number';
				$phone.parent().addClass('has-error');
				$phone.focus();
				return false;
			}

			if(angular.isDefined($localStorage.user))
			{
				phonegap.stats.event('My Info', 'Update Details', 'Updating existing User Details');

				sqlite.query(
					'UPDATE `panic_user_details` SET `full_name` = ?, `email_address` = ?, `phone_number` = ?, `last_modified` = ? WHERE `device_id` = ?',
					[
						$scope.user.full_name,
						$scope.user.email_address,
						$scope.user.phone_number,
						Date.now(),
						$localStorage.device.uuid
					],
					function()
					{
						phonegap.stats.event('My Info', 'Update Details Success', 'User Updated their Info');

						$localStorage.user.full_name = $scope.user.full_name;
						$localStorage.user.email_address = $scope.user.email_address;
						$localStorage.user.phone_number = $scope.user.phone_number;

						$state.go('app.info', { section: 'enter-pin' });
					}
				);
			}
			else
			{
				phonegap.stats.event('My Info', 'New Details', 'Adding User Details');

				sqlite.query(
					'INSERT OR REPLACE INTO panic_user_details (device_id, full_name, email_address, phone_number, last_modified) VALUES (?, ?, ?, ?, ?)',
					[
						$localStorage.device.uuid,
						$scope.user.full_name,
						$scope.user.email_address,
						$scope.user.phone_number,
						Date.now()
					],
					function()
					{
						phonegap.stats.event('My Info', 'New Details Success', 'Added User Details');

						$localStorage.user = {
							device_id: $localStorage.device.uuid,
							full_name: $scope.user.full_name,
							email_address: $scope.user.email_address,
							phone_number: $scope.user.phone_number
						};

						// $state.go('app.info', { section: 'picture' });
						$state.go('app.info', { section: 'enter-pin' });
					}
				);
			}
		};

		$scope.takePicture = function(){

			phonegap.stats.event('My Info', 'Take Picture', 'Taking Picture');

			if(typeof navigator.camera !== 'undefined')
			{
				var camera_options = {
					quality : 100,
					destinationType : Camera.DestinationType.DATA_URL,
					sourceType : Camera.PictureSourceType.CAMERA,
					allowEdit : true,
					encodingType: Camera.EncodingType.JPEG,
					targetWidth: 250,
					targetHeight: 250,
					saveToPhotoAlbum: false
				};

				navigator.camera.getPicture(function(){

					var s3URI = encodeURI("https://panic-press-us.s3.amazonaws.com/"),
						policyBase64 = "MY_BASE64_ENCODED_POLICY_FILE",
						signature = "MY_BASE64_ENCODED_SIGNATURE",
						awsKey = 'my AWSAccessKeyId',
						acl = "public-read";

				}, function(){

				}, camera_options);
			}
			else
			{
				phonegap.notification.alert(
					'This feature is not available on your device.',
					function(){},
					'Feature Unavailable',
					'OK'
				);
			}
		};

		$scope.addPicture = function()
		{
			phonegap.stats.event('My Info', 'Add Picture', 'Added Users Picture');

			$state.go('app.info', { section: 'enter-pin' });
		};

		$scope.addPin = function()
		{
			phonegap.stats.event('My Info', 'Security PIN', 'Updating Security PIN');

			$localStorage.pin = $scope.pin;
			$localStorage.securityPin = $scope.pin.securityPin1 + '' + $scope.pin.securityPin2 + '' + $scope.pin.securityPin3 + '' + $scope.pin.securityPin4;

			$('input.pin').removeClass('error');

			if($localStorage.securityPin.length == 4)
			{
				$state.go('app.info', { section: 'verify-pin' });
			}
			else
			{
				phonegap.stats.event('My Info', 'Security PIN Error', 'Invalid Security PIN');
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

		$scope.verifyPin = function()
		{
			phonegap.stats.event('My Info', 'Verify Security PIN', 'Verifying Security PIN');

			$scope.securityVerifyPin = $scope.pin.securityVerifyPin1 + '' + $scope.pin.securityVerifyPin2 + '' + $scope.pin.securityVerifyPin3 + '' + $scope.pin.securityVerifyPin4;

			$('input.pin').removeClass('error');

			if($localStorage.securityPin == $scope.securityVerifyPin)
			{
				phonegap.stats.event('My Info', 'Security PIN Verified', 'User typed same Security PIN');

				sqlite.query(
					'UPDATE panic_user_details SET security_pin = ?, last_modified = ? WHERE device_id = ?',
					[
						$localStorage.securityPin,
						Date.now(),
						$localStorage.device.uuid
					],
					function()
					{
						phonegap.stats.event('My Info', 'Saving Security PIN', 'Updating Users Security PIN');

						$localStorage.user.security_pin = $localStorage.securityPin;

						delete $localStorage.pin;
						delete $localStorage.securityPin;

						$state.go('app.info', { section: 'enter-fake-pin' });
					}
				);
			}
			else
			{
				phonegap.stats.event('My Info', 'Verify Security PIN Error', 'Failed to Verify Security PIN');
			}

			if($localStorage.pin.securityPin1 != $scope.pin.securityVerifyPin1)
			{
				$('#securityVerifyPin1').addClass('error');
			}
			if($localStorage.pin.securityPin2 != $scope.pin.securityVerifyPin2)
			{
				$('#securityVerifyPin2').addClass('error');
			}
			if($localStorage.pin.securityPin3 != $scope.pin.securityVerifyPin3)
			{
				$('#securityVerifyPin3').addClass('error');
			}
			if($localStorage.pin.securityPin4 != $scope.pin.securityVerifyPin4)
			{
				$('#securityVerifyPin4').addClass('error');
			}
		};

		$scope.addFakePin = function()
		{
			phonegap.stats.event('My Info', 'Fake PIN', 'Updating Fake Security PIN');

			$scope.pinAlert = null;

			$localStorage.pin = $scope.pin;
			$localStorage.fakePin = $scope.pin.fakePin1 + '' + $scope.pin.fakePin2 + '' + $scope.pin.fakePin3 + '' + $scope.pin.fakePin4;

			$('input.pin').removeClass('error');

			if($localStorage.fakePin.length == 4 && $localStorage.fakePin !== $localStorage.user.security_pin)
			{
				$state.go('app.info', { section: 'verify-fake-pin' });
			}
			else if($localStorage.fakePin === $localStorage.user.security_pin)
			{
				phonegap.stats.event('My Info', 'Fake PIN Error', 'User typed same Real & Fake Security PINs');

				$scope.pinAlert = 'Real & Fake PINs are Identical.';
				$('#fakePin1, #fakePin2, #fakePin3, #fakePin4').addClass('error');
			}
			else
			{
				phonegap.stats.event('My Info', 'Fake PIN Error', 'Invalid Fake Security PIN');
			}

			if($scope.pin.fakePin1 == null)
			{
				$('#fakePin1').addClass('error');
			}
			if($scope.pin.fakePin2 == null)
			{
				$('#fakePin2').addClass('error');
			}
			if($scope.pin.fakePin3 == null)
			{
				$('#fakePin3').addClass('error');
			}
			if($scope.pin.fakePin4 == null)
			{
				$('#fakePin4').addClass('error');
			}
		};

		$scope.verifyFakePin = function()
		{
			$scope.fakeVerifyPin = $scope.pin.fakeVerifyPin1 + '' + $scope.pin.fakeVerifyPin2 + '' + $scope.pin.fakeVerifyPin3 + '' + $scope.pin.fakeVerifyPin4;

			$('input.pin').removeClass('error');

			if($localStorage.fakePin === $scope.fakeVerifyPin)
			{
				phonegap.stats.event('My Info', 'Fake PIN Verified', 'User typed same Fake Security PIN');

				sqlite.query(
					'UPDATE panic_user_details SET fake_security_pin = ?, last_modified = ? WHERE device_id = ?',
					[
						$localStorage.fakePin,
						Date.now(),
						$localStorage.device.uuid
					],
					function()
					{
						phonegap.stats.event('My Info', 'Saving Fake Security PIN', 'Updating Users Fake Security PIN');

						$localStorage.user.fake_security_pin = $localStorage.fakePin;

						delete $localStorage.fakePin;

						$state.go('app.info', { section: 'complete' });
					}
				);
			}

			if($localStorage.pin.fakePin1 != $scope.pin.fakeVerifyPin1)
			{
				$('#fakeVerifyPin1').addClass('error');
			}
			if($localStorage.pin.fakePin2 != $scope.pin.fakeVerifyPin2)
			{
				$('#fakeVerifyPin2').addClass('error');
			}
			if($localStorage.pin.fakePin3 != $scope.pin.fakeVerifyPin3)
			{
				$('#fakeVerifyPin3').addClass('error');
			}
			if($localStorage.pin.fakePin4 != $scope.pin.fakeVerifyPin4)
			{
				$('#fakeVerifyPin4').addClass('error');
			}
		};
	}
]);