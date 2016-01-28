/*globals angular*/
(function(){ 'use strict'

	var app = angular.module('chatApp');

	app
	.directive('autoScroll', function(){
		return {
			restrict : 'A',
			link: function(scope, element, attrs){
				scope.$watch(
					function(){
						return $(element)[0].scrollHeight;
					}, 
					function(nv){
						$(element).animate({ scrollTop: nv }, "slow");
					}
				);
			}
		};
	});



})();