'use strict';
/* Controllers */

// Form controller
app.controller('AppController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.isHomePage = ( $scope.currentPage == 'app.home' );

		$scope.$watch('currentPage', function(newValue, oldValue){
			$scope.isHomePage = ( newValue == 'app.home' );
		});
	}
]);