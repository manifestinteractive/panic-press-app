app.controller('HistoryController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.history = (angular.isDefined($localStorage.history))
			? $localStorage.history
			: {};

		sqlite.query('SELECT * FROM panic_history', [], function(contacts){

			// make contacts an array if its not already
			if(typeof history.id !== 'undefined')
			{
				history = [history];
			}

			$localStorage.history = history;

			$scope.$apply(function(){
				$scope.history = history;
			});
		});
	}
]);