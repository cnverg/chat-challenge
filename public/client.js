$('#chat-div').hide();
var user_name = "";
function login() {
  user_name = $("#user-name").val();
  if(!user_name) {
    alert("Enter user name");
    return false;
  }
  $('#chat-inside').text("Hi " + user_name + ", Welcome to Chat Room");
  $('#chat-div').show();
  $('#user-info').hide();
}
function logout() {
  $('#messages').empty();
  $('#chat-div').hide();
  $('#user-info').show();
}

var socket = io();

//
// Handle an incoming message
//

var usercolor = '';
socket.on('connect', function() {
  usercolor = getRandomColor();
});
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

$('form').submit(function(){
  var data = {
    name: user_name,
    color: usercolor,
    message: $('#message').val()
  };
  socket.emit('chat message', data);
  $('#message').val('');
  return false;
});
socket.on('chat message', function(chatData){
  var prefix = "/giphy";
  var temp_masg = chatData.message;
  if(chatData.message.slice(0, prefix.length) == prefix) {
    chatData.message = chatData.message.replace(prefix, "");
    var split_msg = chatData.message.split(" ");
    split_msg = split_msg.filter(Boolean);
    var giphy_str = "";
    for (i = 0; i < split_msg.length; i++) {
      if(i == 0) {
        giphy_str = giphy_str + split_msg[i];
      } else {
        giphy_str = giphy_str + "+" + split_msg[i];
      }
    }
    var xhr = $.get("http://api.giphy.com/v1/gifs/search?q= '" + giphy_str + "'&api_key=dc6zaTOxFJmzC&limit=1");
    xhr.done(function(data) {
      if(data.meta.status == 200) {
        var p_temp = '<p style="color: ' + chatData.color + ' "><b> ' + chatData.name + ':</b></p>';
        $('#messages').append('<li> ' + p_temp +  ' <img src="' + data.data[0].images.downsized.url + '" width="' + data.data[0].images.downsized.width + '" height="' + data.data[0].images.downsized.height + '" alt="gif" /></br></li>');
      } else {
        var span_temp = '<span style="color: ' + chatData.color + ' "><b> ' + chatData.name + ':</b></span>';
        $('#messages').append($('<li>').html(span_temp + chatData.message));
      }
    });
  } else {
    var span_temp = '<span style="color: ' + chatData.color + ' "><b> ' + chatData.name + ':</b></span>';
    $('#messages').append($('<li>').html(span_temp + chatData.message));
  }
  $('li').eq(10).focus();
});

socket.on('message', function (data) {
  console.log(data);
});

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
function send(room, message) {
  socket.emit('send', {
    room: room,
    message: message
  });
}