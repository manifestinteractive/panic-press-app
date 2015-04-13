'use strict';

/**
 * Config for the router
 */
angular.module('app').run([
	'$rootScope', '$state', '$stateParams', '$anchorScroll', '$localStorage', '$location', '$window', '$timeout',
	function($rootScope, $state, $stateParams, $anchorScroll, $localStorage, $location, $window, $timeout)
	{
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
		$rootScope.isMobile = false;
		$rootScope.currentPage = 'app.home';
		$rootScope.showLogo = false;
		$rootScope.showMenu = false;

		$rootScope.getWidth = function() {
			return $(window).width();
		};

		$rootScope.scrollToTop = function()
		{
			scroll_to_top();
		};

		$rootScope.$watch($rootScope.getWidth, function(newValue, oldValue) {
			$rootScope.isMobile = ( newValue < 768 );
		});

		window.onresize = function(){
			$rootScope.$apply();
		};

		// Check for certain State Changes
		$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
			$rootScope.currentPage = toState.name;
			load_jquery();
		});
		// Check for certain State Changes
		$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
			$rootScope.currentPage = toState.name;
		});
	}
])
.config(
[
	'$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider)
	{
		$urlRouterProvider.otherwise('/app/home');
		
		// User Signin & Registration
		$stateProvider
		.state('app', {
			abstract: true,
			url: '/app',
			templateUrl: 'templates/app.html',
			controller: 'AppController'
		})
		.state('app.error', {
			url: '/error',
			templateUrl: 'templates/partials/error.html'
		})
		.state('app.home', {
			url: '/home',
			templateUrl: 'templates/partials/home.html',
			controller: 'HomeController'
		})
		.state('app.info', {
			url: '/info',
			templateUrl: 'templates/partials/info.html',
			controller: 'InfoController'
		})
		.state('app.contacts', {
			url: '/contacts',
			templateUrl: 'templates/partials/contacts.html',
			controller: 'ContactsController'
		})
		.state('app.history', {
			url: '/history',
			templateUrl: 'templates/partials/history.html',
			controller: 'HistoryController'
		})
		.state('app.support', {
			url: '/support',
			templateUrl: 'templates/partials/support.html',
			controller: 'SupportController'
		})
		.state('app.share', {
			url: '/share',
			templateUrl: 'templates/partials/share.html',
			controller: 'ShareController'
		})
	}
]);