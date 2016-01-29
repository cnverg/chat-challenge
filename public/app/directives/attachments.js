/*globals angular*/
(function(){ 'use strict'

	var app = angular.module('chatApp');

	app
	.directive('giphyAttachment', function(){
		return {
			restrict: 'E',
			scope: {
				content: '='
			},
			templateUrl: 'app/directives/templates/attachments/giphy.html',
			controller: function($scope){ }
		};
	})
	.directive('errorAttachment', function(){
		return {
			restrict: 'E',
			scope: {
				content: '='
			},
			templateUrl: 'app/directives/templates/attachments/error.html',
			controller: function($scope){ }
		};
	});



})();