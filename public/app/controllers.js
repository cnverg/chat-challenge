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
			$scope.openRename = function(){
				DialogService.showRename({ oldNickname: user.nickname })
					.then(function(newNickname){
						ChatService.changeName(newNickname);
					});
			}


		}
	)
	.controller('RenameController', 
		function($scope, options, close, $timeout){
			$scope.active = false;
	        $timeout(function(){ $scope.active = true; }, 50);
	        var exit = $scope.exit = function (newNickname) {
	            $scope.active = false; 
	            close(newNickname, 300);
	        };


	        $scope.newNickname = options.oldNickname;

	        $scope.done = function(newNickname){
	        	if(newNickname)
	        		exit(newNickname);
	        }

		}
	)


})();