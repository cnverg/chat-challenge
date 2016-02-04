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

let roomCache = {};
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
    let _sessionRoom = '';
    /**
     * Allows the client to join a specified room
     * @param  {[String]} roomId  id of the room
     * @return {[Unit]}           effectful void
     */
    const join = (roomId, user) => {
      _user = user;
      socket.join(roomId);

      _sessionRoom = roomId;
      roomCache[roomId] = roomCache[roomId] || [];
      socket.broadcast.to(roomId).emit(Constants.grieve, Object.assign({}, server, { content: `${user.name} connected`, timestamp: Date.now() }));
    };

    /**
     * Allows the client to leave a specified room
     * @param  {[String]} roomId  id of the room
     * @return {[Unit]}           effectful void
     */
    const leave = (roomId, user) => {
      _sessionRoom = '';
      socket.leave(roomId);
    };

    /**
     * Allows client to send message to any room they belong to
     * @param  {[Socket]} socket  socket in which the action will take effect
     * @param  {[Object]}   data  message information
     * @return {[Unit]}     effectful void
     */
    const send = (data) => {
      const message = Object.assign({}, data, { timestamp: Date.now(), room: undefined });

      io.sockets.in(data.room).emit(Constants.message, message);
      roomCache[data.room].push(message);
    };

    /**
     * Allows client to know when a User logged in
     * @param   {[Object]}  user  user
     * @return  {[Unit]}          effectful void
     */
    const userEnter = (user) => {
      users.push(user);
      userUpdate();
    }

    /**
     * Allows client to know when a User logged out
     * @param   {[Object]}  user  user
     * @return  {[Unit]}          effectful void
     */
    const userLeave = (user) => {
      users = users.filter(u => u.id != user.id);
      userUpdate();

      _user = {};
    }

    /**
     * Updates user list in all sockets
     * @return {[Unit]} effectful void
     */
    const userUpdate = () => {
      io.sockets.emit(Constants.userUpdate, users);
    }

    /**
     * Allows client to create a chatroom
     * @param  {[String]} room  name of the room
     * @return {[Unit]}         effectful void
     */
    const chatroomCreate = (room) => {
      fs.writeFileSync(chatroomsDat, rooms.concat([room]).join('\n'));

      rooms = getChatroomData();
      roomUpdate();
    }

    /**
     * Allows client to delete a chatroom
     * @param  {[String]} room  name of the room
     * @return {[Unit]}         effectful void
     */
    const chatroomDelete = (room) => {
      writeToChatroomData(rooms.filter(r => r !== room).join('\n'));

      rooms = getChatroomData();
      roomUpdate();
    }

    /**
     * Updates room list in all sockets
     * @return {[Unit]} effectful void
     */
    const roomUpdate = () => {
      io.sockets.emit(Constants.roomUpdate, rooms);
    }

    /**
     * Updates messages of the client from the server cache
     * @param   {[String]}  target  chat Room / private Chat
     * @return  {[Unit]}            effectful void
     */
    const messageUpdate = (target) => {
      io.to(socket.id).emit(Constants.bulkMessageUpdate, roomCache[target]);
    }

    /**
     * Allows client to disconnect from the application
     * @return  {[Unit]}  effectful void
     */
    const disconnect = () => {
      socket.broadcast.to(_sessionRoom).emit(Constants.grieve, Object.assign({}, server, {
        content: `${_user.name} disconnected`, timestamp: Date.now()
      }));

      userLeave(_user);
      leave(_sessionRoom, _user);
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
      .on(Constants.chatroomDelete, chatroomDelete)
      .on(Constants.refreshUsers, userEnter)
      .on(Constants.refreshRooms, roomUpdate)
      .on(Constants.refreshMessages, messageUpdate);
  })();
}

io.sockets.on(Constants.connection, connection);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
 const addr = server.address();
 console.log("Chat server listening at", addr.address + ":" + addr.port);
});