app.controller('PinController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', function($scope, $localStorage, $state, $stateParams, $timeout)
	{
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
	}
]);