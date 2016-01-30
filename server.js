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
		[roomName] : {
			userId: user
		}
		*/
	}
};

io.on('connection', function(socket) {


	//
	// initialize session
	//
	statics.counter++;
	var nameIdx = Math.round(Math.random()*(statics.defaultNames.length-1));
	socket.session = {
		id		: statics.counter,
		nickname: statics.defaultNames[nameIdx] + ' ' + statics.counter,

		// keep track of rooms joined to handle disconnect
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
	socket.on('join', function(roomName, done) {
		socket.join(roomName, function(){
			// update rooms joined
			socket.session.rooms = socket.rooms;

			// add user to rooms list
			addUserToRoom(roomName, socket.session);

			// send user list to this client
			socket.emit('userList', statics.rooms[roomName]);

			// send room
			socket.to(roomName).emit(
				'userEnter', 
				createUserEnterMessage(socket.session)
			);

			done(true);
		});
	});



	//
	// Allow the client to leave a specified room
	//
	socket.on('leave', function(roomName, done) {
		socket.leave(roomName, function(){
			// update rooms joined
			socket.session.rooms = socket.rooms;

			// remove user from room and room if it is empty
			removeUserFromRoom(roomName, socket.session);

			// notify everybody else
			socket.to(roomName).emit(
				'userLeave', 
				createUserLeaveMessage(socket.session)
			);

			done(true);
		});

	});



	//
	// Allow the client to send a message to any room
	// they have already joined, all plugins will run on this message
	//
	socket.on('send', function(data, done) {
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
			done(true);
			console.log('message processed');
		})
		.catch(function(err){
			done(false);
			console.log('this point should never be reached ALERT!!');
			console.log(err);
		});

	});


	//
	// handle disconnected user 
	// notify all users and remove from rooms
	// 
	socket.on('disconnect', function(){
		var session = socket.session;
		for(var roomName in session.rooms){

			// remove user from room and room if it is empty
			removeUserFromRoom(roomName, socket.session);

			socket.to(roomName).emit(
				'userLeave', 
				createUserLeaveMessage(socket.session)
			);
		}
	});


	//////////////////////////////
	// Remove user from room map
	function removeUserFromRoom(roomName, session){
		if(statics.rooms[roomName]){
			var room = statics.rooms[roomName];
			delete room[session.id];
			// memory leak if empty rooms are not cleaned
			if(Object.keys(room).length == 0) 
				delete statics.rooms[roomName];
		}
	}

	// Add user to room map
	function addUserToRoom(roomName, session){
		if(!statics.rooms[roomName]){
				statics.rooms[roomName] = {};
			}
		statics.rooms[roomName][socket.session.id] = socket.session.nickname;
	}


	// Create SocketMessage for 'userLeave'
	function createUserLeaveMessage(session){
		return {
			text	 : session.nickname + ' has left',
			timestamp: new Date(),
			oldUser  : { 
				id 		 : session.id,
				nickname : session.nickname
			}
		}
	}

	// Create SocketMessage for 'userEnter'
	function createUserEnterMessage(session){
		return {
			text	 : session.nickname + ' has joined',
			timestamp: new Date(),
			newUser  : { 
				id 		 : session.id,
				nickname : session.nickname
			}
		}
	}

});

