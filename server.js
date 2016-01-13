var path    = require('path');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);


app.use(express.static(path.join(__dirname, '/public')));


module.exports = {
  'app': app,
  'io': io
};
