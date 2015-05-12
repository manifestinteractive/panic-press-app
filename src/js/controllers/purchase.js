app.controller('PurchaseController', [
	'$scope', '$localStorage', '$state', '$window', function($scope, $localStorage, $state, $window)
	{
		phonegap.stats.event('App', 'Page', 'Purchase');

		$scope.products = (typeof $window.store !== 'undefined') ? $window.store.products : [];

		$scope.upgradedTo5 = (typeof $window.store !== 'undefined')
			? $window.store.get('upgrade_to_5_contacts').owned
			: false;

		$scope.toggle = function(id)
		{
			$(id).collapse('toggle');
		};

		$scope.purchase = function(product)
		{
			if(typeof $window.store != 'undefined' && typeof product == 'object')
			{
				phonegap.stats.event('Purchase', 'Product', 'Purchasing ' + product.title);
				$window.store.order(product.id);
			}
		};
	}
]);