"use strict";

var fs      = require('fs');
var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var Constants = require('./public/app/utils/constants');
var compose = require('./public/app/utils/helpers').compose;
var users = [];

const chatroomsDat = './resources/chatrooms.dat';

const format = (str) => str.split('\n').map(r => r.trim().replace(/ +/g, '_'));

const getChatroomData = compose(format, fs.readFileSync.bind(fs, chatroomsDat, 'utf8'));
const writeToChatroomData = fs.writeFileSync.bind(fs, chatroomsDat);

var rooms = getChatroomData();

app.use(express.static(path.join(__dirname, '/public')));

/**
 * Handles a new client connection and setup
 * @param  {[Socket]} socket  socket in which the action will take effect
 * @return {[Unit]}           effectful void
 */
const connection = function(socket) {
  const server = { fromSystem: true };
  
  // Returning IIFE to have private cache for each socket
  return (function() {
    let _user = {};
    let _rooms = [];
    /**
     * Allows the client to join a specified room
     * @param  {[String]} roomId  id of the room
     * @return {[Unit]}           effectful void
     */
    const join = (roomId, user) => {
      socket.join(roomId);
      _rooms.push(roomId);
      socket.broadcast.to(roomId).emit(Constants.grieve, Object.assign({}, server, { content: `${_user.name} connected`, timestamp: Date.now() }));
    };

    /**
     * Allows the client to leave a specified room
     * @param  {[String]} roomId  id of the room
     * @return {[Unit]}           effectful void
     */
    const leave = (roomId, user) => {
      socket.leave(roomId);
      _rooms.splice(_rooms.indexOf(roomId), 1);
      socket.broadcast.to(roomId).emit(Constants.grieve, Object.assign({}, server, { content: `${_user.name} disconnected`, timestamp: Date.now() }));
    };

    /**
     * Allows client to send message to any room they belong to
     * @param  {[Socket]} socket  socket in which the action will take effect
     * @param  {[Object]}   data  message information
     * @return {[Unit]}     effectful void
     */
    const send = (data) => {
      socket.broadcast.to(data.room).emit(Constants.message, { from: data.from, content: data.content, timestamp: data.timestamp });
    };

    /**
     * Allows client to know when a User logged in
     * @param   {[Object]}  user  user
     * @return  {[Unit]}          effectful void
     */
    const userEnter = (user) => {
      _user = user;
      users.push(user);
      socket.broadcast.emit(Constants.userUpdate, users);
    }

    /**
     * Allows client to know when a User logged out
     * @param   {[Object]}  user  user
     * @return  {[Unit]}          effectful void
     */
    const userLeave = (user) => {
      _user = {};
      users = users.filter(u => u.id != user.id);
      socket.broadcast.emit(Constants.userUpdate, users);
    }

    /**
     * Allows client to create a chatroom
     * @param  {[String]} room  name of the room
     * @return {[Unit]}         effectful void
     */
    const chatroomCreate = (room) => {
      fs.writeFileSync(chatroomsDat, rooms.concat([room]).join('\n'));

      rooms = getChatroomData();
      io.sockets.emit(Constants.roomUpdate, rooms)
    }

    /**
     * Allows client to delete a chatroom
     * @param  {[String]} room  name of the room
     * @return {[Unit]}         effectful void
     */
    const chatroomDelete = (room) => {
      writeToChatroomData(rooms.filter(r => r !== room).join('\n'));

      rooms = getChatroomData();
      io.sockets.emit(Constants.roomUpdate, rooms)
    }

    /**
     * Allows client to disconnect from the application
     * @return  {[Unit]}  effectful void
     */
    const disconnect = () => {
      _rooms.forEach(r => leave(r, _user));
      userLeave(_user);
    }

    // Adding listeners
    socket
      .on(Constants.send, send)
      .on(Constants.join, join)
      .on(Constants.leave, leave)
      .on(Constants.userEnter, userEnter)
      .on(Constants.userLeave, userLeave)
      .on(Constants.disconnect, disconnect)
      .on(Constants.chatroomCreate, chatroomCreate)
      .on(Constants.chatroomDelete, chatroomDelete);


    // Set up defaults
    socket
      .emit(Constants.userUpdate, users)
      .emit(Constants.roomUpdate, rooms);
  })();
}

io.sockets.on(Constants.connection, connection);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
 const addr = server.address();
 console.log("Chat server listening at", addr.address + ":" + addr.port);
});