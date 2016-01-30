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

var users = [];
var rooms = ["DevTeam"];

//
// Handle a new client connection and setup
// event handlers
//

io.on('connection', function (socket) {

    //
    //Send the list of connected users and available rooms
    //

    updateUsers();
    updateRooms();

    //
    // Allow the client to join a specified room
    //

    socket.on('join', function (data) {
        socket.join(data.roomName);
        socket.username = data.userName;
        socket.room = data.roomName;
        users.push(data.userName);
        sendUserConnectedBcMsg(socket, true);
        updateUsers();
    });

    //
    // Allow the client to leave a specified room
    //

    socket.on('leave', function (roomName) {
        socket.leave(roomName);
        handleDisconnectedUser(socket);
        updateUsers();
    });

    //
    // Allow the client to send a message to any room
    // they have already joined
    //

    socket.on('send', function (data) {
        socket.to(data.room).emit('message', {
            message: data.message,
            timestamp: Date.now(),
            userName: socket.username
        });

    });

    //
    //Handle a disconnected client
    //

    socket.on('disconnect', function () {
        handleDisconnectedUser(socket);
        updateUsers();
    });

    //
    //Delete an user from the list of users
    //

    function deleteUser(user) {
        var index = 0;
        for (var i = 0; i < users.length; i++) {
            if (users[i] === user) {
                index = i;
                break;
            }
        }
        users.splice(index, 1);
    }

    //
    //Send a BC to users to inform if a new users joined or an user has left the chat
    //

    function sendUserConnectedBcMsg(sck, connected) {
        var msg = connected ? " has joined" : " has left";
        sck.to(sck.room).emit('message', {
            message: sck.username + msg,
            timestamp: Date.now(),
            userName: 'SERVER'
        });
    }

    //
    //Deletes an user from the list and send a BC
    //

    function handleDisconnectedUser(sck) {
        if (sck.username && userIsConnected(sck.username)) {
            deleteUser(sck.username);
            sendUserConnectedBcMsg(sck, false);
        }
    }

    function updateUsers() {
        io.sockets.emit('updateUsers', users);
    }

    function updateRooms() {
        io.sockets.emit('updateRooms', rooms);
    }

    //
    //Checks if an user is connected
    //

    function userIsConnected(userName) {
        return users.indexOf(userName) != -1;
    }
});
