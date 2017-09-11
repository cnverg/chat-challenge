//
//App module
//

angular.module('chatChallenge', ['ngCookies']);
var app = angular.module('chatChallenge');

//
//Main Controller
//
app.controller('chatChallengeCtrl', function ($rootScope, $scope, SocketFactory, LoginFactory, GiphyFactory) {

    //
    //Vars
    //

    $scope.data = {};
    $scope.data.users = [];
    $scope.currentUser = "";
    $scope.currentMessage = "";
    $scope.data.messages = [];
    $scope.data.rooms = ["DevTeam"];
    $scope.showModal = !LoginFactory.exist('userName');
    $scope.currentRoom = $scope.data.rooms.length > 0 ? $scope.data.rooms[0] : "";
    $scope.notAvailableUsers = [];

    //
    //Add a new message to the list of messages
    //

    $scope.addMessage = function (msg, moment) {
        var date = moment(msg.timestamp).format('MMMM Do YYYY h:mm a');
        $scope.data.messages.push(
        {
            message: msg.message,
            date: date,
            userName: msg.userName,
            type: msg.type
        });
    };


    //
    //Add message to the message's list
    //

    $scope.formatMessage = function(message, moment, type) {
        var msg = {
            message: message,
            date: Date.now(),
            userName: $scope.currentUser,
            type: type
        };
        $scope.addMessage(msg, moment);
    }

    //Handle when the user writes a message

    $scope.sendMessage = function (room, message) {
        if (message) {
            if (GiphyFactory.isGiphyRequest(message)) {
                var searchTerm = GiphyFactory.GetSearchTerm(message);
                GiphyFactory.GetGiphyGif(searchTerm, $scope, moment, room);
            } else {
                var type = 'message';
                $scope.formatMessage(message, moment, type);
                $scope.send(room, { message: message, type: type });
                $scope.currentMessage = "";
            }
        }
    };

    //
    //Send message to sever
    //

    $scope.send = function (room, data) {
        SocketFactory.emit('send', {
            room: room,
            message: data.message,
            type: data.type
        });
    };

    //
    //Checks if the userName is available before starting the chat.
    //

    $scope.selectCurrentUser = function (userName) {
        if (userName && $scope.isUserNameAvailable(userName)) {
            startChat(userName);
        } else {
            alert('The username is not available. Please select another username');
        }
    };

    //
    //Handle when a messages arrives
    //

    SocketFactory.on('message', function (data) {
        if($scope.currentUser) 
            $scope.addMessage(data, moment);
    });

    //Update the list of connected users

    SocketFactory.on('updateUsers', function (data) {
        if ($scope.currentUser) {
            $scope.data.users = data;
        } else {
            $scope.notAvailableUsers = data;
        }
    });

    //
    //Update the list of available rooms
    //

    SocketFactory.on('updateRooms', function (data) {
        $scope.data.rooms = data;
    });

    //
    //Destroy sockets handler when controller is destroyed
    //

    $scope.$on('$destroy', function (event) {
        SocketFactory.removeListeners();
    });

    //
    //Handle the logout functionality
    //

    $scope.logOut = function () {
        LoginFactory.logOut();
        $scope.toogleModal();
        $scope.cleanUp();
        SocketFactory.emit('leave');
    };

    //
    //Checks if there is an user logged before starting chat
    //

    if ($scope.currentUser || LoginFactory.getCurrent()) {
        startChat($scope.currentUser);
    } 

    //
    //Start the chat
    //

    function startChat(userName) {
        if (LoginFactory.exist('userName')) {
            $scope.currentUser = LoginFactory.getCurrent();
        } else {
            $scope.currentUser = userName;
            LoginFactory.logIn(userName);
            $scope.toogleModal();
        }
        SocketFactory.emit('join', {
            roomName: $scope.currentRoom, userName: $scope.currentUser
        });
    }

    //
    //Show and hide the modal for user registration
    //

    $scope.toogleModal = function() {
        $scope.showModal = !$scope.showModal;
    };

    //
    //Delete all messages and users from the UI
    //

    $scope.cleanUp = function () {
        $scope.data.users = [];
        $scope.data.messages = [];
        $scope.currentUser = "";
    };

    //
    //Checks if an userName is available
    //

    $scope.isUserNameAvailable = function (userName) {
        return $scope.notAvailableUsers.indexOf(userName) == -1;
    };
});
