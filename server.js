"use strict";

var fs      = require('fs');
var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var Constants = require('./public/app/utils/constants');
var users = [];

const chatroomsDat = './resources/chatrooms.dat';
var rooms = fs.readFileSync(chatroomsDat, 'utf8').split('\n').map(r => r.trim().replace(/ +/, '_'));

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
  const join = (roomId, user) => {
    socket.broadcast.emit(Constants.leave, roomId, user);

    socket.join(roomId);

    socket.broadcast.to(roomId).emit(Constants.greet, user);
  };

  /**
   * Allows the client to leave a specified room
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[String]} roomId  id of the room
   * @return {[Unit]}           effectful void
   */
  const leave = (roomId, user) => {
    socket.leave(roomId);

    socket.broadcast.to(roomId).emit(Constants.grieve, user);
  };

  /**
   * Allows client to send message to any room they belong to
   * @param  {[Socket]} socket  socket in which the action will take effect
   * @param  {[Object]}   data  message information
   * @return {[Unit]}     effectful void
   */
  const send = (data) => {    
    socket.broadcast.to(data.room).emit(Constants.message, Object.assign(data, { timestamp: Date.now() }));
  };

  /**
   * Allows client to know when a User logged in
   * @param   {[Object]}  user  user
   * @return  {[Unit]}          effectful void
   */
  const userEnter = (user) => {
    users.push(user);
    socket.broadcast.emit(Constants.userUpdate, users);
  }

  /**
   * Allows client to know when a User logged out
   * @param   {[Object]}  user  user
   * @return  {[Unit]}          effectful void
   */
  const userLeave = (user) => {
    users = users.filter(u => u.id != user.id);
    socket.broadcast.emit(Constants.userUpdate, users);
  }

  /**
   * Allows client to create a chatroom
   * @param  {[String]} room  name of the room
   * @return {[Unit]}         effectful void
   */
  const chatroomCreate = (room) => {
    rooms.push(room);    
    fs.writeFileSync(chatroomsDat, rooms.join('\n'));
    socket.emit(Constants.roomUpdate, rooms)
  }

  /**
   * Allows client to delete a chatroom
   * @param  {[String]} room  name of the room
   * @return {[Unit]}         effectful void
   */
  const chatroomDelete = (room) => {
    const roomIdx = rooms.indexOf(room);
    rooms.splice(roomIdx, 1);

    fs.writeFileSync(chatroomsDat, rooms.join('\n'));
    socket.emit(Constants.roomUpdate, rooms)
  }

  // Adding listeners
  socket
    .on(Constants.send, send)
    .on(Constants.join, join)
    .on(Constants.leave, leave)
    .on(Constants.userEnter, userEnter)
    .on(Constants.userLeave, userLeave)
    .on(Constants.chatroomCreate, chatroomCreate)
    .on(Constants.chatroomDelete, chatroomDelete);


  // Set up defaults
  socket
    .emit(Constants.userUpdate, users)
    .emit(Constants.roomUpdate, rooms);
}

io.on(Constants.connection, connection);
