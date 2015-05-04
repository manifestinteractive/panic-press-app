angular.module('app').filter('formatDateShort', function()
{
	return function(date)
	{
		return moment(date).format('ddd, MMM Do, YYYY');
	}
});