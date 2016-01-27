/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp').factory('ChatService', 
		function($rootScope, $timeout){

			var socket = io();
			var service = {
				join  	  : join,
				leave 	  : leave,
				send  	  : send,
				changeName: changeName,
				socket: socket,
				user: {
					nickname: null,
					id: null
				},
				room  : {
					events: [],
					name: null,
					connected: false
				}
			}

			// on message received
			socket.on('message', function (data) {
				$timeout(function() {		
	        		service.room.events.push({
	        			type     : 'message',
	      				message  : data.message,
	      				timestamp: data.timestamp,
	      				user     : data.user,
	        		});
				}, 0);
      		});

      		socket.on('welcome', function(data){
      			$timeout(function() {
					service.user.nickname = data.nickname;
					service.user.id = data.id;
      			}, 0);
      		});

      		// on action received
      		socket.on('action', function(data){
				$timeout(function() {	
	        		service.room.events.push({
	        			type     : 'action',
	      				message  : data.message,
	      				timestamp: data.timestamp,
	        		});
				}, 0);
      		});

      		socket.on('disconnect', function(){
      			$timeout(function(){
      				service.room.connected = false;
      			},0);
      		});

			return service;
			/////////////////////////////////////
			

			// service exposed functions
			function join(roomName){
				if(service.room.name != roomName){
					service.room.events = [];
					service.room.name = roomName;
				}
				service.room.connected = true;
				service.room.events.push(
					{
						message: 'you joined ' + roomName,
						timestamp: new Date(),
						type: 'action'
					}
				);
				socket.emit('join', roomName);
			}
			function leave(roomName){
				service.room.connected = false;
				service.room.events.push({
					message: 'you leaved ' + roomName,
					timestamp: new Date(),
					type: 'action'
				});
				socket.emit('leave', roomName);
			}
			function send(roomName, msg){
				service.room.events.push({
					message: msg,
					user: service.user.nickname,
					timestamp: new Date(),
					type: 'message',
				});
				socket.emit('send', {
					room: roomName,
					message: msg
				})
			}
			function changeName(nickname){
				service.room.events.push({
					message: 'you changed the nickname to ' + nickname,
					type: 'action'
				});
				service.user.nickname = nickname;
				socket.emit('changeName', nickname);
			}
		}
	)

})();