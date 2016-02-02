"use strict";

var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '/public')));

server.listen(3000, () => {
  console.log('Ready to chat on port 3000!');
});


/**
 * Handles a new client connection and setup
 * @param  {[Socket]} socket  socket in which the action will take effect
 * @return {[Unit]}           effectful void
 */
const connection = (socket) => {
  /**
   * Allows the client to join a specified room
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[String]} roomId  id of the room
   * @return {[Unit]}           effectful void
   */
  const join = (socket, roomId) => {
    console.log(roomId);
    socket.join(roomId);
  };

  /**
   * Allows the client to leave a specified room
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[String]} roomId  id of the room
   * @return {[Unit]}           effectful void
   */
  const leave = (socket, roomId) => {
    console.log(roomId);
    socket.leave(roomId);
  };

  /**
   * Allows client to send message to any room they belong to
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[Object]}   data  message information
   * @return {[Unit]}     effectful void
   */
  const send = (socket, data) => {
    console.log(data);
    
    socket.to(data.room).emit('message', {
      message: data.message,
      timestamp: Date.now()
    });
  };

  // Adding listeners
  socket
    .on('send', send.bind(null, socket))
    .on('join', join.bind(null, socket))
    .on('leave', leave.bind(null, socket));  
}

io.on('connection', connection);
