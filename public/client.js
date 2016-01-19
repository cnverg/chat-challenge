// This function is hides the chat page and shows only Join page.
$('#chat-info').hide();

var user_name = "";

//
// This function will be executed when user click on join button
//

function login() {
    user_name = $("#user-name").val();
    if (!user_name) {
        alert("Enter user name");
        return false;
    }
    $('#chat-inside').text("Hi " + user_name + ", Welcome to Chat Room");
    $('#chat-info').show();
    $('#user-info').hide();
}

//
// This function will be executed when user click on log out button
//
function logout() {
    $('#messages').empty();
    $('#chat-info').hide();
    $('#user-info').show();
}

var socket = io();

//
// Handle an incoming message
//

var usercolor = '';

// This function will be executed as soon as user get connected to the server
socket.on('connect', function () {
    usercolor = getRandomColor();
});

// This function randomly generate color for individual user
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// This function is called as soon as form get submitted
$('form').submit(function () {
    var data = {
        name: user_name,
        color: usercolor,
        message: $('#message').val()
    };
    socket.emit('chat message', data);
    $('#message').val('');
    return false;
});

// This function is used when there will not be any image related to message
function noImageAvailable(chatData) {
    var span_temp = '<span style="color: ' + chatData.color + ' "><b> ' + chatData.name + ':</b></span>';
    $('#messages').append($('<li>').html(span_temp + chatData.message));
}

// This function is used when there will not be any image related to message
function imageAvailable(data, p_temp) {
    $('#messages').append('<li> ' + p_temp + ' <img src="' + data.data[0].images.downsized.url + '" width="' + data.data[0].images.downsized.width / 4 + '" height="' + data.data[0].images.downsized.height / 4 + '" alt="gif" /></br></li>');
}

// This function executes when server emit the data/message
socket.on('chat message', function (chatData) {
    var prefix = "/giphy";
    var temp_masg = chatData.message;
    if (chatData.message.slice(0, prefix.length) == prefix) {
        chatData.message = chatData.message.replace(prefix, "");
        var split_msg = chatData.message.split(" ");
        split_msg = split_msg.filter(Boolean);
        var giphy_str = "";
        for (i = 0; i < split_msg.length; i++) {
            if (i == 0) {
                giphy_str = giphy_str + split_msg[i];
            } else {
                giphy_str = giphy_str + "+" + split_msg[i];
            }
        }
        var xhr = $.get("http://api.giphy.com/v1/gifs/search?q= '" + giphy_str + "'&api_key=dc6zaTOxFJmzC&limit=1");
        xhr.done(function (data) {
            if (data.meta.status == 200) {
                var p_temp = '<p style="color: ' + chatData.color + ' "><b> ' + chatData.name + ':</b></p>';
                if (data.data.length > 0) {
                    imageAvailable(data, p_temp);
                } else {
                    noImageAvailable(chatData);
                }
            } else {
                noImageAvailable(chatData);
            }
        });
    } else {
        noImageAvailable(chatData);
    }
    $("html, body").animate({scrollTop: $(document).height()}, 1000);
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