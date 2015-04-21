app.controller('WelcomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		if(angular.isDefined($localStorage.user))
		{
			$state.go('app.home');
			return false;
		}

		$scope.animate = function(){
			$('.start-button').addClass('animated fadeOutRightBig');
			$('.fadeOut').addClass('animated fadeOutUp');

			$timeout(function(){
				$state.go('app.info', { section: 'details' });
			}, 650);
		};
	}
]);