"use strict";

var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var Constants = require('./public/app/utils/constants');
var users = [];
var rooms = [ 'random' ];

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
  const join = (roomId) => {
    console.log(roomId);
    socket.join(roomId);
  };

  /**
   * Allows the client to leave a specified room
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[String]} roomId  id of the room
   * @return {[Unit]}           effectful void
   */
  const leave = (roomId) => {
    console.log(roomId);
    socket.leave(roomId);
  };

  /**
   * Allows client to send message to any room they belong to
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[Object]}   data  message information
   * @return {[Unit]}     effectful void
   */
  const send = (data) => {
    console.log(data);
    
    socket.to(data.room).emit(Constants.message, {
      message: data.message,
      timestamp: Date.now()
    });
  };

  /**
   * Allows client to know when a User logged in
   * @param   {[Object]}  user  user
   * @return  {[Unit]}          effectful void
   */
  const userEnter = (user) => {
    users.push(user);
    console.log("User Logged In");

    socket.broadcast.emit(Constants.userUpdate, users);
  }

  /**
   * Allows client to know when a User logged out
   * @param   {[Object]}  user  user
   * @return  {[Unit]}          effectful void
   */
  const userLeave = (user) => {
    console.log("User Logged Out");

    users = users.filter(u => u.id != user.id);
    socket.broadcast.emit(Constants.userUpdate, users);
  }

  // Adding listeners
  socket
    .on(Constants.send, send)
    .on(Constants.join, join)
    .on(Constants.leave, leave)
    .on(Constants.userEnter, userEnter)
    .on(Constants.userLeave, userLeave);

  // Set up actions
  socket
    .emit(Constants.userUpdate, users)
    .emit(Constants.roomUpdate, rooms);
}

io.on(Constants.connection, connection);
