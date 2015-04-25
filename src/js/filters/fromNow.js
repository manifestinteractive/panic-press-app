angular.module('app').filter('fromNow', function()
{
	return function(date)
	{
		return moment(date).fromNow();
	}
});