"use strict";

var fs      = require('fs');
var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var Constants = require('./public/app/utils/constants');
var helpers   = require('./public/app/utils/helpers');

var compose = helpers.compose;
var isMd5 = helpers.isMd5;
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
 * 
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
     * Allows client to join in the application
     * 
     * @param  {[Object]} user        user that joined
     * @param  {[String]} defaultRoom default room (if entered directly to a room)
     * @return {[Unit]}               effectful void
     */
    const addUser = (user, defaultRoom) => {
      if(defaultRoom) {
        socket.room = defaultRoom;
        socket.join(socket.room);
      } else {
        socket.room = '';
      }

      socket.user = user;

      users.push(socket.user);

      userUpdate();
    }

    /**
     * Allows client to leave the application
     * 
     * @return {[Unit]}               effectful void
     */
    const removeUser = () => {
      if(socket.room) {
        _emitLeaveRoom(socket.room);
        socket.leave(socket.room);
        socket.room = '';
      }

      users.splice(users.indexOf(socket.user), 1);

      socket.user = {};
      
      userUpdate();
    }

    /**
     * Allows client to switch room
     * Client can be in one room at a time
     * 
     * @param  {[String]} room  desired room to join
     * @return {[Unit]}         effectful void
     */
    const switchRoom = (room) => {
      roomCache[room] = roomCache[room] || [];

      socket.leave(socket.room);
      _emitLeaveRoom(socket.room);

      socket.join(room);
      socket.emit(Constants.bulkMessageUpdate, roomCache[room]);

      if (isMd5(room)) {
        _emitEnterRoom(room, 'You are now in a private chat');
        _broadcastEnterRoom(room, `${socket.user.name} opened a private chat with you`);
      } else {
        _emitEnterRoom(room, `You have joined ${room}`);
        _broadcastEnterRoom(room, `${socket.user.name} has joined the room`);
      }

      socket.room = room;
    }

    /**
     * Emits a message to current client
     * 
     * @param  {[String]} room      desired room to notify
     * @param  {[String]} content   body of the message
     * @return {[Unit]}             effectful void
     */
    const _emitEnterRoom = (room, content) => 
{      socket.emit(Constants.serverMessage, _buildServerMessage(content));
    }

    /**
     * Emits a message to every client but this one
     * 
     * @param  {[String]} room      desired room to notify
     * @param  {[String]} content   body of the message
     * @return {[Unit]}             effectful void
     */
    const _broadcastEnterRoom = (room, content) => {
      socket.broadcast.to(room).emit(Constants.serverMessage, _buildServerMessage(content));
    }

    /**
     * Constructs message from server
     * 
     * @param  {[String]} content   body of the message
     * @return {[Unit]}             effectful void
     */
    const _buildServerMessage = (content) => Object.assign({}, server, { content, timestamp: Date.now() });

    /**
     * Emits to all involved users in a room
     * that a client has left the session
     * 
     * @param  {[String]} room  desired room to notify
     * @return {[Unit]}         effectful void
     */
    const _emitLeaveRoom = (room) => {
      socket.broadcast.to(socket.room).emit(Constants.serverMessage, Object.assign({}, server, {
        content: `${socket.user.name} has left the room`, timestamp: Date.now()
      }));
    }

    /**
     * Allows client to send message to any room they belong to
     * 
     * @param  {[Object]}   data  message information
     * @return {[Unit]}           effectful void
     */
    const send = (data) => {
      if (data.status < 200 || data.status >= 300) {
        socket.emit(Constants.serverMessage, Object.assign({}, server, {
          content: data.statusText,
          timestamp: Date.now()
        }));
      } else {
        const message = Object.assign({}, data, { timestamp: Date.now(), room: undefined });

        io.sockets.in(data.room).emit(Constants.message, message);

        roomCache[data.room].push(message);
      }
    };

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
      users = users.filter(u => u.id != socket.user.id);

      _emitLeaveRoom(socket.room);
      socket.leave(socket.room);
    }

    // Adding listeners
    socket
      .on(Constants.chatroomCreate, chatroomCreate)
      .on(Constants.chatroomDelete, chatroomDelete)
      .on(Constants.refreshMessages, messageUpdate)
      .on(Constants.refreshUsers, userUpdate)
      .on(Constants.refreshRooms, roomUpdate)
      .on(Constants.disconnect, removeUser)
      .on(Constants.switchRoom, switchRoom)
      .on(Constants.addUser, addUser)
      .on(Constants.send, send);
  })();
}

io.sockets.on(Constants.connection, connection);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
 const addr = server.address();
 console.log("Chat server listening at", addr.address + ":" + addr.port);
});