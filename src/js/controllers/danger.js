'use strict';
/* Controllers */

// Form controller
app.controller('DangerController', [
	'$scope', '$localStorage', '$state', '$stateParams', '$timeout', function($scope, $localStorage, $state, $stateParams, $timeout)
	{
		var dangers_text = {
			'physical-attack': 'Physical Attack',
			'verbal-attack': 'Verbal Attack',
			'car-accident': 'Car Accident',
			'fire-danger': 'Fire Danger',
			'being-followed': 'I\'m Being Followed',
			'high-risk-activity': 'High-Risk Activity',
			'feeling-unsafe': 'Feeling Unsafe',
			'completely-lost': 'Completely Lost'
		};

		var dangers_html = {
			'physical-attack': 'Physical<br/>Attack',
			'verbal-attack': 'Verbal<br/>Attack',
			'car-accident': 'Car<br/>Accident',
			'fire-danger': 'Fire<br/>Danger',
			'being-followed': 'I\'m Being<br/>Followed',
			'high-risk-activity': 'High-Risk<br/>Activity',
			'feeling-unsafe': 'Feeling<br/>Unsafe',
			'completely-lost': 'Completely<br/>Lost'
		};

		var types = {
			'immediate': 'Immediate Danger',
			'potential': 'Potential Danger'
		};

		$scope.type = $stateParams.type;
		$scope.danger = $stateParams.danger;

		$scope.type_text = types[$stateParams.type];
		$scope.danger_text = dangers_text[$stateParams.danger];
		$scope.danger_html = dangers_html[$stateParams.danger];

		$timeout(function(){
			$('.contact-1 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
			$('.contact-1 span').text('sent').removeClass('label-warning').addClass('label-info');
		}, 3000);

		$timeout(function(){
			$('.contact-2 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-check');
			$('.contact-2 span').text('sent').removeClass('label-warning').addClass('label-info');
		}, 4000);

		$timeout(function(){
			$('.contact-3 i').removeClass('fa-spin fa-circle-o-notch text-light').addClass('fa-times text-red');
			$('.contact-3 span').text('error').removeClass('label-warning').addClass('label-danger');
		}, 5000);

		$timeout(function(){
			$('.contact-1 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
			$('.contact-1 span').text('read').removeClass('label-warning label-info').addClass('label-success');
		}, 10000);

		$timeout(function(){
			$('.contact-2 i').removeClass('fa-spin fa-circle-o-notch fa-check text-light').addClass('fa-eye');
			$('.contact-2 span').text('read').removeClass('label-warning label-info').addClass('label-success');
		}, 15000);
	}
]);