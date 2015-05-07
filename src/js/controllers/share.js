app.controller('ShareController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		phonegap.stats.event('App', 'Page', 'Share');

		$scope.rateApp(true);
	}
]);