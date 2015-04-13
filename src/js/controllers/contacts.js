'use strict';
/* Controllers */

// Form controller
app.controller('ContactsController', [
	'$scope', '$localStorage', '$state', '$timeout', function($scope, $localStorage, $state, $timeout)
	{
		$scope.showJane = true;
		$scope.showJohn = true;
		$scope.showJack = true;
		$scope.timer = null;

		$scope.remainingContacts = 2;

		$scope.removeContact = function(name)
		{
			$timeout.cancel($scope.timer);

			if(name == 'jane')
			{
				$scope.timer = $timeout(function(){
					$scope.showJane = false;
					$scope.remainingContacts += 1;
				}, 500);
			}
			else if(name == 'john')
			{
				$scope.timer = $timeout(function(){
					$scope.showJohn = false;
					$scope.remainingContacts += 1;
				}, 500);
			}
			else if(name == 'jack')
			{
				$scope.timer = $timeout(function(){
					$scope.showJack = false;
					$scope.remainingContacts += 1;
				}, 500);
			}
		};
	}
]);