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
	})
	.directive('autofocus', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			link: function($scope, $element) {
				$timeout(function() {
					$element[0].focus();
				});
			}
		}
	}])
	.directive('escKey', function () {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 27) { // 27 = esc key
                    scope.$apply(function () {
                        scope.$eval(attrs.escKey);
                    });
                    event.preventDefault();
                }
            });
        };
    });



})();