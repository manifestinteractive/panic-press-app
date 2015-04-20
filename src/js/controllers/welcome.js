'use strict';
/* Controllers */

// Form controller
app.controller('WelcomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		$scope.animate = function(){
			$('.start-button').addClass('animated fadeOutRightBig');
			$('.fadeOut').addClass('animated fadeOutUp');

			$timeout(function(){
				$state.go('app.info');
			}, 650);
		};
	}
]);