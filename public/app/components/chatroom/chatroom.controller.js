import { Inject } from '../../utils/decorators';
import Constants from '../../utils/constants';

@Inject('$scope', '$stateParams', 'socket')
export default class ClassroomController {
  constructor($scope, $stateParams, socket) {
    Object.assign(this, { $scope, socket });

    $scope.messages = [];
    let mostRecentMessage = {};
    $scope.$parent.selectedTarget = $scope.target = $stateParams.target;

    $scope.addMessage = $scope.messages.push.bind($scope.messages);

    $scope.processMessage = (message) => {
      if (mostRecentMessage.from && mostRecentMessage.from.id === message.from.id) {
        mostRecentMessage.content.push(message.content);
      } else {
        message.content = message.content.split('\n');
        $scope.addMessage(message);
        mostRecentMessage = message;        
      }
    }

    $scope.safeAddMessage = (message) => $scope.$apply(() => $scope.addMessage(message));
    $scope.safeProcessMessage = (message) => $scope.$apply(() => $scope.processMessage(message));

    socket.on(Constants.greet, $scope.safeAddMessage);
    socket.on(Constants.grieve, $scope.safeAddMessage);
    socket.on(Constants.message, $scope.safeProcessMessage);

    socket.emit(Constants.join, $scope.target);

    $scope.$on('$destroy', () => {
      socket.emit(Constants.leave, $scope.target);
    });

    $scope.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    const msg = { room: this.$scope.target, from: this.$scope.user, content: this.$scope.message, timestamp: Date.now() };
    this.socket.emit(Constants.send, msg);

    this.$scope.processMessage(msg);

    this.$scope.message = ''
    this.$scope.messageForm.$setPristine();
  }
}
