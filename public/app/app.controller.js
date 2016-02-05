import { User } from './models/user';
import { Inject } from './utils/decorators';
import Constants from './utils/constants'

@Inject('$scope', 'SocketFactory', 'UserFactory')
export default class AppController {
  constructor($scope, SocketFactory, UserFactory) {
    const socket = SocketFactory($scope);

    this.socket = socket;

    $scope.selectedTarget = '';
    $scope.user = UserFactory.get();

    socket
      .on(Constants.userUpdate, (users) =>
        $scope.users = users)

      .on(Constants.roomUpdate, (rooms) =>
        $scope.rooms = rooms)

      .emit(Constants.addUser, $scope.user, $scope.selectedTarget)

      .emit(Constants.refreshUsers)

      .emit(Constants.refreshRooms);

    $scope.notCurrentUser = (user) => user.id !== $scope.user.id;
  }
};
