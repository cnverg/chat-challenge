/*globals angular*/
(function(){ 'use strict'

	var app = angular.module('chatApp');

	app
	.directive('eventsViewer', function(){
		return {
			restrict : 'E',
			replace  :true,
			scope    : {
				events: '='
			},
			templateUrl : 'app/directives/templates/eventsViewer.html',
			controller: function($scope, $element, $attrs){ }
		};
	})
	.directive('messageViewer', function(){
		return {
			restrict : 'E',
			replace  :true,
			scope    : {
				message: '='
			},
			templateUrl : 'app/directives/templates/messageViewer.html',
			controller: function($scope, $element, $attrs){ }
		};
	})
	.directive('actionViewer', function(){
		return {
			restrict : 'E',
			replace  :true,
			scope    : {
				action: '='
			},
			templateUrl : 'app/directives/templates/actionViewer.html',
			controller: function($scope, $element, $attrs){ }
		};
	});



})();