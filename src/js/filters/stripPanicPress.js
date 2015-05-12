angular.module('app').filter('stripPanicPress', function () {
	return function (title) {
		if (!title) { return ''; }

		var value = title.toString().trim().replace('(Panic Press)', '');

		return value.trim();
	};
});
