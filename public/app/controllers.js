/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp')
	.controller('MainController', 
		function($scope, ChatService, DialogService){

			// objects used in view
			var user 		= $scope.user 		 = ChatService.user;
			var currentRoom = $scope.currentRoom = ChatService.room;

			// ng-models for inputs
			$scope.newRoom = "Lobby";
			$scope.newMessage = "";
			$scope.newNickname = null;
			
			// enter the lobby
			ChatService.join('Lobby');

			
			// functions for the view
			$scope.join = function(room){
				ChatService.join(room);
			}
			$scope.leave = function(room){
				ChatService.leave(room);
			}
			$scope.send = function(msg){
				if(currentRoom.connected && msg){
					ChatService.send(currentRoom.name, msg);
					$scope.newMessage = '';
				}
			}
			$scope.changeName = function(nickname){
				if(nickname){
					ChatService.changeName(nickname);
				}
				$scope.newNickname = '';
			}
			$scope.usersCount = function(){
				return currentRoom.users ? Object.keys(currentRoom.users).length : 0;
			}
			$scope.leave = function(){
				DialogService.showConfirmModal({ 
					text : 'Are you sure you want to leave this room', 
					title: 'Leave the Room'
				})
				.then(function(){
					ChatService.leave(currentRoom.name);
				});
			}
			$scope.changeNickname = function(){
				DialogService.showInputModal({ 
					text: user.nickname, 
					title:  'Write the new nickname'
				})
				.then(function(newNickname){
					ChatService.changeName(newNickname);
				});
			}
			$scope.joinRoom = function(){
				DialogService.showInputModal({ 
					text: currentRoom.name,
					title:  'Write the name of the room to join'
				})
				.then(function(newRoom){
					ChatService.join(newRoom);
				});
			}


		}
	)


})();