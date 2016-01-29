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
	counter : 0
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
		});
		socket.to(roomName).emit('action', {
			text	 : socket.session.nickname + ' has joined',
			timestamp: new Date()
		});
	});

	//
	// Allow the client to leave a specified room
	//
	socket.on('leave', function(roomName) {
		socket.to(roomName).emit('action', {
			text	 : socket.session.nickname + ' has left',
			timestamp: new Date()
		})
		socket.leave(roomName, function(){
			socket.session.rooms = socket.rooms;
		});

	});

	//
	// Allow the client to send a message to any room
	// they have already joined, all plugins will run on this message
	//
	socket.on('send', function(data) {
		var context = {
			io    : io,
			socket: socket,
			data  : data,
			room  : (data || {}).room,
			msg   : {
				text: data.text,
				user: socket.session.nickname,
			},
			event : 'send',
		}
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
			socket.to(room).emit('action', {
				text	 : session.nickname + ' has left',
				timestamp: new Date()
			});
		}
	})

});

