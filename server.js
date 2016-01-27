"use strict";

var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '/public')));

server.listen(3000, function() {
	console.log('Ready to chat on port 3000!');
});

//
// Handle a new client connection and setup
// event handlers
//
var id = 0;
io.on('connection', function(socket) {

	//
	// initialize session
	//
	id++;
	socket.session = {
		id: id,
		nickname: 'Uknown ' + id
	};

	// 
	// Send welcome data to the client
	//
	socket.emit('welcome', {
		nickname: socket.session.nickname,
		id: socket.session.id
	});


	//
	// Allow the client to join a specified room
	//
	socket.on('join', function(roomName) {
		socket.join(roomName);
		socket.to(roomName).emit('action', {
			message: socket.session.nickname + ' has joined'
		});
	});

	//
	// Allow the client to change its nickname
	//
	socket.on('changeName', function(nickname){
		var oldNick = socket.session.nickname;
		if(nickname == oldNick)return;
		for(var room in socket.rooms){
			socket.to(room).emit('action', {
				message: oldNick + ' has renamed to ' + nickname
			});
		}
		socket.session.nickname = nickname;
	});

	//
	// Allow the client to leave a specified room
	//
	socket.on('leave', function(roomName) {
		socket.to(roomName).emit('action', {
			message: socket.session.nickname + ' has left'
		})
		socket.leave(roomName);


	});

	//
	// Allow the client to send a message to any room
	// they have already joined
	//
	socket.on('send', function(data) {
		socket.to(data.room).emit('message', {
			message: data.message,
			user: socket.session.nickname,
			timestamp: Date.now()
		});

	});

	socket.on('disconnect', function(){
		for(var room in socket.rooms){
			socket.to(room).emit('action', {
				message: oldNick + ' has renamed to ' + nickname
			});
		}
		console.log('disconnected');
	})

});
