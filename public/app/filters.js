/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp').filter('trunc', function(){
		return function(input, length){
			if(length == null)length = 1000;
			if(length < 4	 )length = 4;

			if(input.length > length){
				return input.slice(0, length-3) + '...';
			}
			return input;

		}
	})


})();