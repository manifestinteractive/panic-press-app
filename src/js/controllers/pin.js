app.controller('PinController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', function($scope, $localStorage, $state, $stateParams, $timeout)
	{
		phonegap.stats.event('App', 'Page', 'Security PIN Verification');

		/**
		 * @todo: Send notifications to Emergency Contacts for Real PIN
		 * @todo: Send notifications to Emergency Contacts for Fake PIN
		 * @todo: Update SQLite to record when Danger cleared & how ( real / fake )
		 */

		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}

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

		$scope.$watch('pin.securityPin1', function(value){
			if(value){ $('#securityPin2').focus(); }
		});
		$scope.$watch('pin.securityPin2', function(value){
			if(value){ $('#securityPin3').focus(); }
			else if($('#securityPin1').val() !== '') { $('#securityPin1').focus(); }
		});
		$scope.$watch('pin.securityPin3', function(value){
			if(value){ $('#securityPin4').focus(); }
			else if($('#securityPin2').val() !== '') { $('#securityPin2').focus(); }
		});
		$scope.$watch('pin.securityPin4', function(value){
			if(value){ }
			else if($('#securityPin3').val() !== '') { $('#securityPin3').focus(); }
		});

		$scope.safe = function()
		{
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
	}
]);