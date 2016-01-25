
//
// socket code
//
var socket = io().connect('http://localhost:3000');;

//
// Handle an incoming message
//
//socket.on('message', function (data) {
//    console.log("hey");
//    angular.element(document.getElementsByTagName('body')).scope().addUser({name: 'hey'});
//    angular.element(document.getElementsByTagName('body')).scope().$apply();
//});

//
// Join a room
//
function join(room) {
    socket.emit('join', room);
}

//
// Leave a room
//
function leave(room) {
    socket.emit('leave', room);
}

//
// Send a message
//
function send1(room, message) {
    socket.emit('send', {
        room: room,
        message: message
    });
}