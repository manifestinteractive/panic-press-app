angular.module('app').filter('formatTime', function()
{
	return function(date)
	{
		return moment(date).format('h:mm A');
	}
});