describe('chatChallenge', function () {

    beforeEach(
        module('ngCookies', 'chatChallenge')
    );

    var $scope, $rootScope, sckFactory, loginFactory, $controller, moment, chatChallengeCtrl;

    beforeEach(function() {
        $scope = {
            $on: function() {},
            data: {
                users: [],
                messages: [],
                rooms: []
            },
            curentUser: "",
            currentMessage: "Cool",
            showModal: false,
            currentRoom: "",
        };
        $rootScope = {};
        sckFactory = {
            on: function() {},
            emit: function() {},
            removeListeners: function() {}
        };
        loginFactory = {
            logIn: function() {},
            logOut: function() {},
            exist: function() {},
            getCurrent: function() {}
        };
        moment = function(date) {
            return {
                format: function(data) { return '01/30/2016'; }
            };
        };
    });

    beforeEach(angular.mock.inject(function (_$controller_) {
        $controller = _$controller_;
        chatChallengeCtrl = $controller('chatChallengeCtrl', { $rootScope: $rootScope, $scope: $scope, SocketFactory: sckFactory, LoginFactory: loginFactory });
    }));

    describe('addMessage', function() {
        var msg;
        beforeEach(function () {
            msg = {
                message: 'test',
                date: '01/30/2016',
                userName: 'aneguzman'
            };
        });

        it('should add a message to the messages array', function() {
            $scope.addMessage(msg, moment);
            expect($scope.data.messages).toContain(msg);
        });

        it('should contains proper objects', function() {
            $scope.addMessage(msg, moment);
            expect($scope.data.messages[0].message).toEqual('test');
            expect($scope.data.messages[0].date).toEqual('01/30/2016');
            expect($scope.data.messages[0].userName).toEqual('aneguzman');
        });
    });

    describe('cleanUp', function() {

        it('should clean up all the messages, users and currentUser var', function() {
            $scope.cleanUp();
            expect($scope.currentUser).toEqual('');
            expect($scope.data.messages).toEqual([]);
            expect($scope.data.users).toEqual([]);

        });
    });

    describe('toogleModal', function() {

        it('should change the showModal value from false to true', function() {
            $scope.showModal = false;
            $scope.toogleModal();
            expect($scope.showModal).toBe(true);
        });

        it('should change the showModal value from true to false', function () {
            $scope.showModal = true;
            $scope.toogleModal();
            expect($scope.showModal).toBe(false);
        });
    });

    describe('isUserNameAvailable', function () {

        it('should return false if the userName is not available', function () {
            $scope.notAvailableUsers = ["ane29"];
            var result = $scope.isUserNameAvailable('ane29');
            expect(result).toBe(false);
        });

        it('should return true if the userName is  available', function () {
            $scope.notAvailableUsers = ["ane29"];
            var result = $scope.isUserNameAvailable('scot28');
            expect(result).toBe(true);
        });

    });
})