describe('chatChallenge', function() {
    beforeEach(angular.mock.module('chatChallenge'));

    var $controller;

    beforeEach(angular.mock.inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('users', function() {
        it('should have an user after added user', function() {
            var $scope = {};
            var controller = $controller('chatChallengeCtrl', { $scope: $scope });
            $scope.data.users.push('ane29');
            $scope.data.users.toContain('ane29');
        });
    })
})