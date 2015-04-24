app.controller('PinController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', function($scope, $localStorage, $state, $stateParams, $timeout)
	{
		/**
		 * @todo: Auto advance PIN input
		 * @todo: Check for Security PIN Accuracy
		 * @todo: Check if user entered Fake PIN
		 * @todo: Build out logic to handle either real or fake PIN
		 */

		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}

		var dangers_text = {
			'physical-attack': 'Physical Attack',
			'verbal-attack': 'Verbal Attack',
			'car-accident': 'Car Accident',
			'fire-danger': 'Fire Danger',
			'being-followed': 'I\'m Being Followed',
			'high-risk-activity': 'High-Risk Activity',
			'feeling-unsafe': 'Feeling Unsafe',
			'completely-lost': 'Completely Lost'
		};

		var dangers_html = {
			'physical-attack': 'Physical<br/>Attack',
			'verbal-attack': 'Verbal<br/>Attack',
			'car-accident': 'Car<br/>Accident',
			'fire-danger': 'Fire<br/>Danger',
			'being-followed': 'I\'m Being<br/>Followed',
			'high-risk-activity': 'High-Risk<br/>Activity',
			'feeling-unsafe': 'Feeling<br/>Unsafe',
			'completely-lost': 'Completely<br/>Lost'
		};

		var types = {
			'immediate': 'Immediate Danger',
			'potential': 'Potential Danger'
		};

		$scope.type = $stateParams.type;
		$scope.danger = $stateParams.danger;
		$scope.status = $stateParams.status;

		$scope.type_text = types[$stateParams.type];
		$scope.danger_text = dangers_text[$stateParams.danger];
		$scope.danger_html = dangers_html[$stateParams.danger];

		$scope.$watch('pin.securityPin1', function(value){ if(value){ $('#securityPin2').focus(); } });
		$scope.$watch('pin.securityPin2', function(value){ if(value){ $('#securityPin3').focus(); } });
		$scope.$watch('pin.securityPin3', function(value){ if(value){ $('#securityPin4').focus(); } });
		$scope.$watch('pin.securityPin4', function(value){ if(value){ } });
	}
]);