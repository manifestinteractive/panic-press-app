angular.module('app').filter('fromNow', function()
{
	return function(date)
	{
		return moment(date).fromNow();
	}
});

angular.module('app').filter('formatDate', function()
{
	return function(date)
	{
		return moment(date).format('dddd, MMMM Do, YYYY');
	}
});

angular.module('app').filter('formatDateShort', function()
{
	return function(date)
	{
		return moment(date).format('ddd, MMM Do, YYYY');
	}
});

angular.module('app').filter('formatTime', function()
{
	return function(date)
	{
		return moment(date).format('h:mm A');
	}
});