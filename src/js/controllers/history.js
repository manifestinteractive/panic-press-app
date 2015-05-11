app.controller('HistoryController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		/**
		 * @todo: Update SQLite to record type, danger & status
		 */

		phonegap.stats.event('App', 'Page', 'History');

		$scope.history = (angular.isDefined($localStorage.history))
			? $localStorage.history
			: {};

		sqlite.query("SELECT id, short_url, status, type, danger, datetime(created_at, 'localtime') AS created_at, datetime((strftime('%s', created_at) / 60) * 60, 'unixepoch') interval FROM panic_history GROUP BY interval ORDER BY interval", [], function(history){

			// check if we have no history
			if(history.empty)
			{
				history = [];
			}

			// make contacts an array if its not already
			if(typeof history.id !== 'undefined')
			{
				history = [history];
			}

			history.reverse();

			$localStorage.history = history;

			$scope.$apply(function(){
				$scope.history = history;
			});
		});
	}
]);