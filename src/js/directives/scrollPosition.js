app.directive('scrollPosition', function($window) {
	return {
		scope: {
			scrollPosition: '=scrollPosition'
		},
		link: function(scope, element, attrs) {
			var windowEl = angular.element($window);
			var handler = function() {
				scope.scrollPosition = windowEl.scrollTop();
			};
			windowEl.on('scroll', scope.$apply.bind(scope, handler));
			handler();
		}
	};
});