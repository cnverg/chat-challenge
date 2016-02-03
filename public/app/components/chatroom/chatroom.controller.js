import { Inject } from '../../utils/decorators';
import Constants from '../../utils/constants';

@Inject('$scope', '$stateParams', 'socket')
export default class ClassroomController {
  constructor($scope, $stateParams, socket) {
    console.log(socket);

    Object.assign(this, { $scope, socket });

    $scope.$parent.selectedTarget = $scope.target = $stateParams.target;

    socket.emit(Constants.join, $scope.target, $scope.user);

    socket.on(Constants.message, (message) => {
      console.log(message);
    });

    socket.on(Constants.greet, (user) => {
      console.log(user);
    });

    socket.on(Constants.grieve, (user) => {
      console.log(user);
    });

    $scope.$on('$destroy', () => {
      socket.emit(Constants.leave, $scope.target, $scope.user);
    });

    $scope.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    this.socket.emit(Constants.send, { room: this.$scope.chatroom, from: this.$scope.user, data: this.$scope.message });

    this.$scope.message = ''
    this.$scope.messageForm.$setPristine();
  }
}
