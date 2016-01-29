"use strict";

var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Promise = require('promise');
var plugins = require('./app/plugins');


app.use(express.static(path.join(__dirname, '/public')));

server.listen(3000, function() {
	console.log('Ready to chat on port 3000!');
});

//
// Handle a new client connection and setup
// event handlers
//
var statics = {
	defaultNames : [
		'Harry Potter',
		'John Smith',
		'Anonymous',
		'Peter Pan',
		'Will Smith',
		'Captain America',
		'Britney Spears'
	],
	counter : 0,
	rooms: { 
		/*
		roomName : {
			userId: user
		}
		*/
	}
}

io.on('connection', function(socket) {

	//
	// initialize session
	//
	statics.counter++;
	socket.session = {
		id		: statics.counter,
		nickname: statics.defaultNames[Math.round(Math.random()*statics.defaultNames.length)] + ' ' + statics.counter,
		rooms	: socket.rooms
	};

	// 
	// Send welcome data to the client
	//
	socket.emit('welcome', {
		nickname: socket.session.nickname,
		id		: socket.session.id
	});


	//
	// Allow the client to join a specified room
	//
	socket.on('join', function(roomName) {
		socket.join(roomName, function(){
			socket.session.rooms = socket.rooms;

			// add user to rooms list
			if(!statics.rooms[roomName]){
				statics.rooms[roomName] = {};
			}
			statics.rooms[roomName][socket.session.id] = socket.session.nickname;

			socket.emit('userList', statics.rooms[roomName]);

			socket.to(roomName).emit('userEnter', {
				text	 : socket.session.nickname + ' has joined',
				timestamp: new Date(),
				newUser  : { 
					id 		 : socket.session.id,
					nickname : socket.session.nickname
				}
			});
		});
	});

	//
	// Allow the client to leave a specified room
	//
	socket.on('leave', function(roomName) {
		socket.leave(roomName, function(){
			socket.session.rooms = socket.rooms;

			// remove user from room
			if(statics.rooms[roomName]){
				delete statics.rooms[roomName][socket.session.id];
			}

			socket.to(roomName).emit('userLeave', {
				text	 : socket.session.nickname + ' has left',
				timestamp: new Date(),
				oldUser  : { 
					id 		 : socket.session.id,
					nickname : socket.session.nickname
				}
			});
			

		});

	});

	//
	// Allow the client to send a message to any room
	// they have already joined, all plugins will run on this message
	//
	socket.on('send', function(data) {
		var context = {
			io      : io,
			socket  : socket,
			data    : data,
			room    : (data || {}).room,
			msg     : {
				text: data.text,
				user: socket.session.nickname,
			},
			event   : 'send',
			rooms   : statics.rooms,
		};
		plugins
		.runPlugins( context )
		.then(function(context){
			console.log('message processed');
		})
		.catch(function(err){
			console.log('this point should never be reached ALERT!!');
			console.log(err);
		});

	});

	socket.on('disconnect', function(){
		var session = socket.session;
		for(var room in session.rooms){
			if(statics.rooms[room]){
				delete statics.rooms[room][socket.session.id];
			}
			socket.to(room).emit('userLeave', {
				text	 : socket.session.nickname + ' has left',
				timestamp: new Date(),
				oldUser  : { 
					id 		 : socket.session.id,
					nickname : socket.session.nickname
				}
			});
		}
	})

});

