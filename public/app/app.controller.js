import md5 from 'md5';
import { User } from './models/user';
import Constants from './utils/constants'
import { Inject } from './utils/decorators';

@Inject('$scope', 'SocketFactory', 'UserFactory')
export default class AppController {
  constructor($scope, SocketFactory, UserFactory) {
    const socket = SocketFactory($scope);

    this.socket = socket;

    $scope.rooms = [];
    $scope.users = [];
    $scope.unread = {};
    $scope.selectedTarget = '';
    $scope.user = UserFactory.get();

    const setRoomIdFor = (user) => {
      const roomId = md5([user.id].concat([$scope.user.id]).sort().join(''));
      return Object.assign({}, user, { roomId })
    }

    const listenToUpdates = (room) => {
      socket.on(`${room}Updated`, (room) => { $scope.unread[room] = true; });
    }

    socket
      .on(Constants.userUpdate, (users) => {
        const usersWithRoomId = users.map(setRoomIdFor);
        usersWithRoomId.filter(u => !$scope.users.some(u2 => u.id == u2.id)).map(u => u.roomId).forEach(listenToUpdates);
        $scope.users = usersWithRoomId;
      })

      .on(Constants.roomUpdate, (rooms) => {
        rooms.filter(r => $scope.rooms.indexOf(r) == -1).forEach(listenToUpdates);
        $scope.rooms = rooms
      })

      .emit(Constants.addUser, $scope.user, $scope.selectedTarget)

      .emit(Constants.refreshUsers)

      .emit(Constants.refreshRooms)

      // In the event of the server being restarted re-sync users
      .on(Constants.syncUser, () => {
        socket.emit(Constants.syncUserApply, $scope.user)
      });

    $scope.notCurrentUser = (user) => user.id !== $scope.user.id;
  }
};
