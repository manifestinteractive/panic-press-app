app.controller('HistoryController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}
	}
]);