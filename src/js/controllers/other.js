app.controller('OtherController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}
	}
]);