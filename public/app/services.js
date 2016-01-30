/*globals angular*/
(function(){ 'use strict'

	var chatApp = angular.module('chatApp');

	chatApp
	.factory('ChatService', 
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
					connected: false,
					users: {}
				}
			}

			// on message received
			socket.on('message', function (data) {
				$timeout(function() {		
					data.type = 'message';
	        		service.room.events.push(data);
				}, 0);
      		});

			// receive user data from server
      		socket.on('welcome', function(data){
      			$timeout(function() {
					service.user.nickname = data.nickname;
					service.user.id = data.id;
      			}, 0);
      		});

      		// on action received
      		socket.on('action', function(data){
				$timeout(function() {	
					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// on user enter received
      		socket.on('userEnter', function(data){
				$timeout(function() {	
					var newUser = data.newUser;
					if(newUser)
						service.room.users[newUser.id] = newUser.nickname;
					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// on user leave received
      		socket.on('userLeave', function(data){
				$timeout(function() {	
					var oldUser = data.oldUser;
					if(oldUser)
						delete service.room.users[oldUser.id];
					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// server changed nickname
      		socket.on('changeName', function(data){
      			$timeout(function() {
      				var user = data.user;
      				if(!user)return;
      				var myId  	 = service.user.id;
      				var userId	 = user.id;
      				var nickname = user.nickname;
      				if(myId == userId)
      					service.user.nickname = nickname;
      				if(service.room.users && service.room.users[userId])
      					service.room.users[userId] = nickname;

					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// receive the usersList
      		socket.on('userList', function(list){
      			$timeout(function() {
      				// list is object { id1 : nickname1, id2 : nickname2}
      				service.room.users = list;
				}, 0);
      		});


      		socket.on('disconnect', function(){
      			$timeout(function(){
      				service.room.connected = false;
      				service.room.users 	   = [];
      			},0);
      		});

			return service;
			/////////////////////////////////////
			

			// service exposed functions
			function join(roomName){
				socket.emit('join', roomName, function(success){
					$timeout(function(){
						if(service.room.name != roomName){
							service.room.events = [];
							service.room.name 	= roomName;
						}
						service.room.connected = true;
						service.room.events.push({
							type: 'action',
							text: 'you joined ' + roomName,
							timestamp: new Date(),
						});
					});
				});
			}
			function leave(roomName){
				socket.emit('leave', roomName, function(success){
					$timeout(function(){
						service.room.connected = false;
						service.room.events.push({
							type	 : 'action' ,
							text	 : 'you left ' + roomName,
							timestamp: new Date(),
						});
						service.room.users 	= [];
					});
				});
			}
			function send(roomName, text){
				socket.emit('send', {
					room: roomName,
					text: text
				});
			}
			function changeName(nickname){
				send(null, '/rename ' + nickname);
			}
		}
	);
	

})();