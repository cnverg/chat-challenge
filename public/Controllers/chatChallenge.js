//
//App module
//

angular.module('chatChallenge', ['ngCookies']);
var app = angular.module('chatChallenge');

//
//Main Controller
//
app.controller('chatChallengeCtrl', function ($rootScope, $scope, socketFactory, loginFactory, giphyFactory) {

    //
    //Vars
    //

    $scope.data = {};
    $scope.data.users = [];
    $scope.currentUser = "";
    $scope.currentMessage = "";
    $scope.data.messages = [];
    $scope.data.rooms = ["DevTeam"];
    $scope.showModal = !loginFactory.exist('userName');
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
            if (giphyFactory.isGiphyRequest(message)) {
                var searchTerm = giphyFactory.getSearchTerm(message);
                giphyFactory.getGiphyGif(searchTerm, $scope, moment, room);
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
        socketFactory.emit('send', {
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

    socketFactory.on('message', function (data) {
        if($scope.currentUser) 
            $scope.addMessage(data, moment);
    });

    //Update the list of connected users

    socketFactory.on('updateUsers', function (data) {
        if ($scope.currentUser) {
            $scope.data.users = data;
        } else {
            $scope.notAvailableUsers = data;
        }
    });

    //
    //Update the list of available rooms
    //

    socketFactory.on('updateRooms', function (data) {
        $scope.data.rooms = data;
    });

    //
    //Destroy sockets handler when controller is destroyed
    //

    $scope.$on('$destroy', function (event) {
        socketFactory.removeListeners();
    });

    //
    //Handle the logout functionality
    //

    $scope.logOut = function () {
        loginFactory.logOut();
        $scope.toogleModal();
        $scope.cleanUp();
        socketFactory.emit('leave');
    };

    //
    //Checks if there is an user logged before starting chat
    //

    if ($scope.currentUser || loginFactory.getCurrent()) {
        startChat($scope.currentUser);
    } 

    //
    //Start the chat
    //

    function startChat(userName) {
        if (loginFactory.exist('userName')) {
            $scope.currentUser = loginFactory.getCurrent();
        } else {
            $scope.currentUser = userName;
            loginFactory.logIn(userName);
            $scope.toogleModal();
        }
        socketFactory.emit('join', {
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
