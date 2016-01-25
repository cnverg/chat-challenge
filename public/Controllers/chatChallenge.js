app.controller('chatChallengeCtrl', function ($rootScope,$scope, SocketFactory) {
    $scope.data = {};
    $scope.data.users = [];
    var currentUser = "aneudy";
    var defaultRoom = 'DevTeam';

    //$scope.data.rooms = ['DevTeam', 'All', 'Random'];

    $scope.addUser = function(user) {
        $scope.data.users.push(user);
    };

//    $scope.addUser();

    SocketFactory.on('message', function (data) {
        $scope.addUser(data.message);
    });

    SocketFactory.on('updateUsers', function (data) {
        $scope.data.users = data;
    });

    SocketFactory.emit('join', defaultRoom);
    SocketFactory.emit('addUser', prompt("Please add your username"));

    $scope.send = function (room, message) {
        SocketFactory.emit('send', {
            room: room,
            message: message
        });
    };
});