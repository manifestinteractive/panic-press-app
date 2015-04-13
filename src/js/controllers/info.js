'use strict';
/* Controllers */

// Form controller
app.controller('InfoController', [
	'$scope', '$localStorage', '$state', function($scope, $localStorage, $state)
	{
		$scope.currentStep = 1;

		$scope.$watch('currentStep', function(newValue, oldValue){ if(newValue !== oldValue){ scroll_to_top(); } });

		$scope.$watch('safetyPin1', function(value){ if(value){ $('#safetyPin2').focus(); } });
		$scope.$watch('safetyPin2', function(value){ if(value){ $('#safetyPin3').focus(); } });
		$scope.$watch('safetyPin3', function(value){ if(value){ $('#safetyPin4').focus(); } });
		$scope.$watch('safetyPin4', function(value){ if(value){ } });

		$scope.$watch('safetyVerifyPin1', function(value){ if(value){ $('#safetyVerifyPin2').focus(); } });
		$scope.$watch('safetyVerifyPin2', function(value){ if(value){ $('#safetyVerifyPin3').focus(); } });
		$scope.$watch('safetyVerifyPin3', function(value){ if(value){ $('#safetyVerifyPin4').focus(); } });
		$scope.$watch('safetyVerifyPin4', function(value){ if(value){ } });

		$scope.$watch('falsePin1', function(value){ if(value){ $('#falsePin2').focus(); } });
		$scope.$watch('falsePin2', function(value){ if(value){ $('#falsePin3').focus(); } });
		$scope.$watch('falsePin3', function(value){ if(value){ $('#falsePin4').focus(); } });
		$scope.$watch('falsePin4', function(value){ if(value){ } });

		$scope.$watch('falseVerifyPin1', function(value){ if(value){ $('#falseVerifyPin2').focus(); } });
		$scope.$watch('falseVerifyPin2', function(value){ if(value){ $('#falseVerifyPin3').focus(); } });
		$scope.$watch('falseVerifyPin3', function(value){ if(value){ $('#falseVerifyPin4').focus(); } });
		$scope.$watch('falseVerifyPin4', function(value){ if(value){ } });
	}
]);