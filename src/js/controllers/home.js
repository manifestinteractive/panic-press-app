app.controller('HomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		phonegap.stats.event('App', 'Page', 'Home');

		$scope.initHome = function()
		{
			$scope.updateMode(function(mode){
				if(mode == 'setup' &&  !angular.isDefined($localStorage.user))
				{
					$state.go('app.welcome');
					return false;
				}
				else if(mode == 'setup' &&  !angular.isDefined($localStorage.contacts))
				{
					$state.go('app.contacts');
					return false;
				}
			});

			if($scope.appMode == 'ready' && !angular.isDefined($localStorage.approvedGPS))
			{
				$timeout($scope.approveGPS, 1000);
			}
		};

		$scope.swipeToPotentialDanger = function(direction){

			phonegap.stats.event('Immediate Danger', 'Swiped', 'User Swiped ' + direction);

			if(direction == 'left')
			{
				$('.danger-zone').addClass('animated fadeOutLeft');
			}
			else
			{
				$('.danger-zone').addClass('animated fadeOutRight');
			}

			$state.go('app.other');
		};
	}
]);