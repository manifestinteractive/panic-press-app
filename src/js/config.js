var app = angular.module('app').config([
	'$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$sceDelegateProvider', '$httpProvider',
	function($controllerProvider, $compileProvider, $filterProvider, $provide, $sceDelegateProvider, $httpProvider)
	{
		// lazy controller, directive and service
		app.controller = $controllerProvider.register;
		app.directive = $compileProvider.directive;
		app.filter = $filterProvider.register;
		app.factory = $provide.factory;
		app.service = $provide.service;
		app.constant = $provide.constant;
		app.value = $provide.value;

		// Configure CORS
		$httpProvider.defaults.useXDomain = true;
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		delete $httpProvider.defaults.headers.common['X-Requested-With'];

		/**
		 * The workhorse; converts an object to x-www-form-urlencoded serialization.
		 * @param {Object} obj
		 * @return {String}
		 */
		var param = function(obj) {
			var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

			for(name in obj) {
				value = obj[name];

				if(value instanceof Array) {
					for(i=0; i<value.length; ++i) {
						subValue = value[i];
						fullSubName = name + '[' + i + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				}
				else if(value instanceof Object) {
					for(subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				}
				else if(value !== undefined && value !== null)
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}

			return query.length ? query.substr(0, query.length - 1) : query;
		};

		// Override $http service's default transformRequest
		$httpProvider.defaults.transformRequest = [function(data) {
			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}];

		// Allow loading from our assets domain.  Notice the difference between * and **.
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'**'
		]);
	}
]);