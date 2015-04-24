app.controller('WelcomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		$scope.updateMode(function(){
			if($scope.appMode == 'ready')
			{
				$state.go('app.home');
				return false;
			}
			else if($scope.appMode == 'setup' && angular.isDefined($localStorage.user) && !angular.isDefined($localStorage.contacts))
			{
				$state.go('app.contacts');
				return false;
			}
		});

		$scope.animate = function(){
			$('.start-button').addClass('animated fadeOutRightBig');
			$('.fadeOut').addClass('animated fadeOutUp');

			$timeout(function(){
				$state.go('app.info', { section: 'details' });
			}, 650);
		};
	}
]);