/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp')
	.controller('InputModalController', 
		function($scope, options, close, $timeout){
			$scope.active = false;
	        $timeout(function(){ $scope.active = true; }, 50);
	        var exit = $scope.exit = function (text) {
	            $scope.active = false; 
	            close(text, 300);
	        };


	        $scope.text = options.text;
	        $scope.title= options.title;

	        $scope.done = function(text){
	        	if(text)
	        		exit(text);
	        }

		}
	)
	.controller('ConfirmModalController', 
		function($scope, options, close, $timeout){
			// Same for all modals
			$scope.active = false;
	        $timeout(function(){ $scope.active = true; }, 50);
	        var exit = $scope.exit = function (text) {
	            $scope.active = false; 
	            close(text, 300);
	        };


	        $scope.text = options.text;
	        $scope.title= options.title;

		}
	);


})();