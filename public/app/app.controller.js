import { User } from './models/user';
import { Inject } from './utils/decorators';
import Constants from './utils/constants'

@Inject('$scope', 'socket', 'UserFactory')
export default class AppController {
  constructor($scope, socket, UserFactory) {
    $scope.selectedTarget = '';
    $scope.user = UserFactory.get();

    socket.emit(Constants.refreshUsers, $scope.user);
    socket.emit(Constants.refreshRooms);

    socket.on(Constants.userUpdate, (users) => {
      $scope.$apply(() => {
        $scope.users = users;
      });
    });

    socket.on(Constants.roomUpdate, (rooms) => {
      $scope.$apply(() => {
        $scope.rooms = rooms;
      });
    });

    $scope.notCurrentUser = (user) => user.id !== $scope.user.id;
  }
};
