app.controller('SupportController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		phonegap.stats.event('App', 'Page', 'Support');

		if( !angular.isDefined($localStorage.user))
		{
			phonegap.stats.event('App', 'Invalid Access', 'Tried to load Support without a User Account');

			$state.go('app.welcome');
			return false;
		}
	}
]);