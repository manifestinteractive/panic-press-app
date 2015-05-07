var user_dismissed_bugs = false;

Bugsnag.releaseStage = (typeof settings !== 'undefined') ? settings.app.environment : 'development';
Bugsnag.appVersion = (typeof settings !== 'undefined') ? settings.app.version : '0.0.0';
Bugsnag.beforeNotify = function(payload)
{
	// Do not use bugsnag during developement
	if(Bugsnag.releaseStage == 'development')
	{
		return false;
	}

	var ignored_errors = [
		'cordova',
		'StatusBar',
		'SQL'
	];

	if(payload.message && new RegExp(ignored_errors.join("|")).test(payload.message) )
	{
		return false;
	}
	else if(payload.file.indexOf('angular.js') > -1)
	{
		return false;
	}

	var clone = JSON.parse(JSON.stringify(payload));
	delete clone.apiKey;
	delete clone.notifierVersion;

	if(clone && typeof clone.name !== 'undefined' && typeof clone.message !== 'undefined')
	{
		phonegap.stats.event('Bugsnag Error', clone.name, clone.message);

		if( !user_dismissed_bugs)
		{
			phonegap.notification.confirm(
				"Sorry for the inconvenience, but it looks like you've stumbled upon a bug in our software.",
				function(results){
					if(results == 2)
					{
						var use_browser = false;
						if(typeof cordova !== 'undefined' && typeof cordova.plugins.email !== 'undefined')
						{
							cordova.plugins.email.isServiceAvailable(
								function (isAvailable) {
									if( !isAvailable)
									{
										use_browser = true;
									}
									else
									{
										cordova.plugins.email.open({
											to: [ 'support@panicpress.zendesk.com' ],
											subject: 'JavaScript Error in Panic Press',
											body: "Greetings,<br \/><br \/>I would like to submit an Error I detected in Panic Press.<br \/><br \/>The following information was generated for your support staff:<br \/><br \/><pre>" + JSON.stringify(clone) + "</pre>",
											isHtml: true
										});
									}
								}
							);
						}
						else
						{
							use_browser = true;
						}

						if(use_browser)
						{
							var subject = 'JavaScript Error in Panic Press';
							var body = "Greetings,\n\nI would like to submit an Error I detected in Panic Press.\n\n The following information was generated for your support staff:\n\n";
							body += JSON.stringify(clone);
							window.open('mailto:support@panicpress.zendesk.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), "_self");
						}
					}
					else
					{
						window.user_dismissed_bugs = true;
					}
				},
				"We've Detected a Problem",
				['Dismiss', 'Submit Bug']
			);
		}
	}
	return true;
};