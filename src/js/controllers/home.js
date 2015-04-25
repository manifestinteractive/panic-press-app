app.controller('HomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		$scope.updateMode(function(){
			if($scope.appMode == 'setup' &&  !angular.isDefined($localStorage.user))
			{
				$state.go('app.welcome');
				return false;
			}
			else if($scope.appMode == 'setup' &&  !angular.isDefined($localStorage.contacts))
			{
				$state.go('app.contacts');
				return false;
			}
		});

		$scope.rateApp(false);
	}
]);