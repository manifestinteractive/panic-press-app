app.controller('ShareController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}

		$scope.rateApp(true);
	}
]);