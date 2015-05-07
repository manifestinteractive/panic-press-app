angular.module('app').filter('formatDate', function()
{
	return function(date)
	{
		return moment(date).format('dddd, MMMM Do, YYYY');
	}
});