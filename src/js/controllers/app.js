app.controller('AppController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.userDetails = $localStorage.userDetails || null;
	}
]);