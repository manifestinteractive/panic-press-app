app.directive('alphaOnly', function(){
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl)
		{
			modelCtrl.$parsers.push(function (inputValue)
			{
				if (inputValue == undefined)
				{
					return '';
				}

				var transformedInput = inputValue.replace(/[^a-zA-Z-. ]/g, '');
				if (transformedInput!=inputValue)
				{
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}

				return transformedInput;
			});
		}
	};
});