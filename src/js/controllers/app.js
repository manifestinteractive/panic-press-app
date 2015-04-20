'use strict';
/* Controllers */

// Form controller
app.controller('AppController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.hideFooter = ( $scope.currentPage == 'app.welcome' );
		$scope.hideNav = ( $scope.currentPage == 'app.welcome' || $scope.currentPage == 'app.danger' );
		$scope.hideDecor =  ( $scope.currentPage == 'app.home' || $scope.currentPage == 'app.other' );

		$scope.$watch('currentPage', function(newValue, oldValue){
			$scope.hideFooter = ( newValue == 'app.welcome' );
			$scope.hideNav = ( newValue == 'app.welcome' || newValue == 'app.danger' );
			$scope.hideDecor =  ( newValue == 'app.home' || newValue == 'app.other' );
		});
	}
]);