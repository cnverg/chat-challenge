/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp').controller('MainController', 
		function($scope, ChatService){

			$scope.newRoom = "test";
			$scope.newMessage = "whats up";
			$scope.user = ChatService.user;
			$scope.newNickname = null;
			var currentRoom = $scope.currentRoom = ChatService.room;
			

			ChatService.join('test');
			$scope.join = function(room){
				ChatService.join(room);
			}
			$scope.leave = function(room){
				ChatService.leave(room);
			}
			$scope.send = function(msg){
				if(currentRoom.connected && msg){
					console.log($scope);
					ChatService.send(currentRoom.name, msg);
					$scope.newMessage = '';
				}
			}
			$scope.changeName = function(nickname){
				if(nickname){
					ChatService.changeName(nickname);
				}
			}


		}
	)


})();