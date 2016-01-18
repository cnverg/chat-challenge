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

//
// Handle a new client connection and setup
// event handlers
//
io.on('connection', function (socket) {

  //
  // Allow the client to join a specified room
  //

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

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
    socket.to(data.room).emit('message', {
      message: data.message,
      timestamp: Date.now()
    });
  });

});
