"use strict";

var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '/public')));

server.listen(3000, function () {
  console.log('Ready to chat on port 3000!');
});

var usernames = [];  
//
// Handle a new client connection and setup
// event handlers
//
io.on('connection', function (socket) {


    //
    // Allow the client to join a specified room
    //
    socket.on('join', function (roomName) {

        socket.join(roomName);

    });

    //
    // Allow the client to leave a specified room
    //
    socket.on('leave', function (roomName) {

        socket.leave(roomName);

    });

    //
    // Allow the client to send a message to any room
    // they have already joined
    //
    socket.on('send', function (data) {
        console.log(data.message);
        socket.to(data.room).emit('message', {
            message: data.message,
            timestamp: Date.now()
        });
        socket.emit('message', {
            message: data.message,
            timestamp: Date.now()
        });
    });

    socket.on('addUser', function(username) {
        socket.username = username;
        usernames.push(username);
        //socket.emit('updatechat', 'SERVER', 'you have connected');
        //socket.broadcast.emit('updatechat', 'SERVER'
        //, username + ' has connected');
        io.sockets.emit('updateUsers', usernames);
    });

});
