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

      		// on user enter received
      		socket.on('userLeave', function(data){
				$timeout(function() {	
					var oldUser = data.oldUser;
					if(oldUser)
						delete service.room.users[oldUser.id];
					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// server changed your nickname
      		socket.on('changeName', function(data){
      			$timeout(function() {
      				var myId = service.user.id;
      				var newNickname = data.newNickname;

      				service.user.nickname = newNickname;
      				if(service.room.users && service.room.users[myId])
      					service.room.users[myId] = newNickname;

					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// server changed your nickname
      		socket.on('userChangeName', function(data){
      			$timeout(function() {
      				var user = data.user;
      				if(user)
      					service.room.users[user.id] = user.nickname;
					data.type = 'action';
	        		service.room.events.push(data);
				}, 0);
      		});

      		// server changed your nickname
      		socket.on('userList', function(list){
      			$timeout(function() {
      				service.room.users = list;
      				console.log(list);
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
				socket.emit('join', roomName);
			}
			function leave(roomName){
				service.room.connected = false;
				service.room.events.push({
					type	 : 'action' ,
					text	 : 'you left ' + roomName,
					timestamp: new Date(),
				});
				service.room.users 	= [];
				socket.emit('leave', roomName);
			}
			function send(roomName, text){
				socket.emit('send', {
					room: roomName,
					text: text
				})
			}
			function changeName(nickname){
				send(null, '/rename ' + nickname);
			}
		}
	);
	

})();