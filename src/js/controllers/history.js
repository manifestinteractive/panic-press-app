app.controller('HistoryController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.history = (angular.isDefined($localStorage.history))
			? $localStorage.history
			: {};

		sqlite.query("SELECT id, short_url, status, datetime(last_modified, 'localtime') AS last_modified, datetime((strftime('%s', last_modified) / 60) * 60, 'unixepoch') interval FROM panic_history GROUP BY interval ORDER BY interval", [], function(history){

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