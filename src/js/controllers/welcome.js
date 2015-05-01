app.controller('WelcomeController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		phonegap.stats.event('App', 'Page', 'Welcome');

		// Call Mode to
		$scope.getMode(function(mode){

			if(mode == 'ready')
			{
				phonegap.stats.event('Welcome', 'Update Mode', 'User already setup, go to home page.');

				$state.go('app.home');
				return false;
			}
			else if(mode == 'setup' && angular.isDefined($localStorage.user) && !angular.isDefined($localStorage.contacts))
			{
				phonegap.stats.event('Welcome', 'Update Mode', 'User added their account, but has no contacts.');

				$state.go('app.contacts');
				return false;
			}
		});

		/**
		 * Just for fun if the user clicks our logo
		 */
		$scope.animate = function()
		{
			var logo = $('#homeLogo');
			var animations = ['bounce', 'flipInX', 'flipInY', 'pulse', 'rubberBand', 'swing'];
			var animation = animations[Math.floor(Math.random()*animations.length)];

			logo.removeClass('animated fadeOut ' + animations.join(' '));
			setTimeout(function(){
				logo.addClass('animated ' + animation);
			}, 250);

			phonegap.stats.event('Welcome', 'Animate', 'User Clicked Logo');
		};

		/**
		 * Take user to Setup
		 */
		$scope.begin = function(){

			phonegap.stats.event('Welcome', 'Begin', 'Clicked Lets Begin');

			$('#homeLogo').removeClass().addClass('fadeOut homeLogo');

			$('.start-button').addClass('animated fadeOutRightBig');
			$('.fadeOut').addClass('animated fadeOutUp');

			$timeout(function(){
				$state.go('app.info', { section: 'details' });
			}, 650);
		};

		$scope.swipeStart = function(direction)
		{
			phonegap.stats.event('Welcome', 'Swiped', 'User Swiped ' + direction);

			$scope.begin();
		};
	}
]);