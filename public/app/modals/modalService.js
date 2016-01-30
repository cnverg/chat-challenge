/*globals angular*/
(function(){ 'use strict'

	var chatApp = angular.module('chatApp');

	chatApp
	.factory('DialogService', function DialogService(ModalService, $q){
        var service = {};
        
        
        service.showInputModal = function(options){
        	var defered = $q.defer();
            ModalService.showModal({
                templateUrl: "app/modals/inputModal.html",
                controller: "InputModalController",
                inputs: {
                    options: options || {} // { text: '', title: '' }
                }
            }).then(function(modal){
            	modal.close
            	.then(function(text){
            		if(typeof text == 'string' && text.length > 0){
	            		defered.resolve(text);
	            	}else{
	            		defered.reject();
	            	}
            	});
            });
            return defered.promise;
        }


 		service.showConfirmModal = function(options){
        	var defered = $q.defer();
            ModalService.showModal({
                templateUrl: "app/modals/confirmModal.html",
                controller: "InputModalController",
                inputs: {
                    options: options || {} // { text: '', title: '' }
                }
            }).then(function(modal){
            	modal.close
            	.then(function(answer){
            		if(answer){
	            		defered.resolve();
	            	}else{
	            		defered.reject();
	            	}
            	});
            });
            return defered.promise;
        }

        
        return service;
    });
	

})();