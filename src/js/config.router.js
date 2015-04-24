angular.module('app').run([
	'$rootScope', '$state', '$stateParams', '$anchorScroll', '$localStorage', '$location', '$window', '$timeout',
	function($rootScope, $state, $stateParams, $anchorScroll, $localStorage, $location, $window, $timeout)
	{
		var hide_footer_pages = ['app.welcome'];
		var hide_nav_pages = ['app.welcome', 'app.danger'];
		var disable_menu_pages = ['app.pin'];
		var hide_decor_pages = ['app.home', 'app.other'];

		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
		$rootScope.isMobile = false;
		$rootScope.currentPage = 'app.home';
		$rootScope.showLogo = false;
		$rootScope.showMenu = false;

		$rootScope.hideFooter = true;
		$rootScope.hideNav = true;
		$rootScope.hideDecor =  true;
		$rootScope.disableMenu = true;

		$localStorage.device = window.device || {
			model: 'x86_64',
			cordova: '3.8.0',
			platform: 'iOS',
			uuid: '31ECFBA3-994E-2884-CDDD-6B2E96084315',
			version: '8.1',
			name: 'Developer Phone'
		};

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
			$timeout(load_jquery, 10);
		});

		// Check for certain State Changes
		$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
			$rootScope.currentPage = toState.name;
			$rootScope.hideFooter = ( hide_footer_pages.indexOf(toState.name) > -1 );
			$rootScope.hideNav = ( hide_nav_pages.indexOf(toState.name) > -1 );
			$rootScope.hideDecor =  ( hide_decor_pages.indexOf(toState.name) > -1 );
			$rootScope.disableMenu = ( disable_menu_pages.indexOf(toState.name) > -1 );
		});
	}
])
.config(
[
	'$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider)
	{
		$urlRouterProvider.otherwise('/app/home');
		
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
		.state('app.welcome', {
			url: '/welcome',
			templateUrl: 'templates/partials/welcome.html',
			controller: 'WelcomeController'
		})
		.state('app.home', {
			url: '/home',
			templateUrl: 'templates/partials/home.html',
			controller: 'HomeController'
		})
		.state('app.other', {
			url: '/other',
			templateUrl: 'templates/partials/other-danger.html',
			controller: 'OtherController'
		})
		.state('app.danger', {
			url: '/danger/{type:(?:immediate|potential)}/{danger:(?:physical-attack|verbal-attack|car-accident|fire-danger|being-followed|high-risk-activity|feeling-unsafe|completely-lost)}/{status:(?:send|sent)}',
			templateUrl: 'templates/partials/danger.html',
			controller: 'DangerController'
		})
		.state('app.pin', {
			url: '/pin/{type:(?:immediate|potential)}/{danger:(?:physical-attack|verbal-attack|car-accident|fire-danger|being-followed|high-risk-activity|feeling-unsafe|completely-lost)}',
			templateUrl: 'templates/partials/enter-pin.html',
			controller: 'PinController'
		})
		.state('app.info', {
			url: '/info/{section:(?:details|picture|enter-pin|verify-pin|enter-fake-pin|verify-fake-pin|complete)}',
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