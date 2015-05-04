app.controller('OtherController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		phonegap.stats.event('App', 'Page', 'Potential Danger');

		if( !angular.isDefined($localStorage.user))
		{
			$state.go('app.welcome');
			return false;
		}

		$scope.swipeToImmediateDanger = function(direction){

			phonegap.stats.event('Potential Danger', 'Swiped', 'User Swiped ' + direction);

			if(direction == 'left')
			{
				$('.danger-zone').addClass('animated fadeOutLeft');
			}
			else
			{
				$('.danger-zone').addClass('animated fadeOutRight');
			}

			$timeout(function(){
				$state.go('app.home');
			}, 500);
		};
	}
]);