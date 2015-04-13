'use strict';

angular.module('app').controller('AppCtrl', [
	'$scope', '$localStorage', '$window',
	function($scope, $localStorage, $window)
	{
		// add 'ie' classes to html
		var isIE = !!navigator.userAgent.match(/MSIE/i);
		isIE && angular.element($window.document.body).addClass('ie');
		isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
		
		var date = new Date();

		// config
		$scope.app = {
			name: 'Panic Press',
			version: '0.5.0',
			color: {},
			settings: {},
			date: {
				today: date.toISOString(),
				time: date.getTime(),
				year: date.getFullYear(),
				month: date.getMonth(),
				day: date.getDate()
			}
		};

		$scope.$watch('app.settings', function(){
			$localStorage.settings = $scope.app.settings;
		}, true);

		// save settings to local storage
		if(angular.isDefined($localStorage.settings))
		{
			$scope.app.settings = $localStorage.settings;
		}
		else
		{
			$localStorage.settings = $scope.app.settings;
		}

		function isSmartDevice($window)
		{
			// Adapted from http://www.detectmobilebrowsers.com
			var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
			
			// Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
			return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
		}

	}
]);