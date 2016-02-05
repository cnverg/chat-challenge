import Constants from '../../utils/constants';
import { Inject } from '../../utils/decorators';
import { compose, lazy, forEach } from '../../utils/helpers';

@Inject('$scope', '$stateParams', 'SocketFactory', 'MessagingFactory')
export default class ChatroomController {
  constructor($scope, $stateParams, SocketFactory, MessagingFactory) {
    $scope.messages = [];
    let mostRecentMessage = {};
    $scope.$parent.selectedTarget = $scope.target = $stateParams.target;

    const scopedSocket = SocketFactory();
    const messenger = MessagingFactory($scope.user);
    Object.assign(this, { $scope, scopedSocket, messenger });

    const addMessage = $scope.messages.push.bind($scope.messages);

    const processMessage = (message) => {
      if (mostRecentMessage.from && mostRecentMessage.from.id === message.from.id) {
        mostRecentMessage.content.push(...message.content);
      } else {
        addMessage(message);
        mostRecentMessage = message;
      }
    }

    scopedSocket      
      .on(Constants.serverMessage, (m) =>
        addMessage(m))

      .on(Constants.message, (m) =>
        processMessage(m))

      .on(Constants.bulkMessageUpdate, (ms) =>
        forEach(processMessage)(ms))
      
      .emit(Constants.switchRoom, $scope.target);

    $scope.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    this.messenger.send(this.$scope.target, this.$scope.message);

    this.$scope.message = ''
    this.$scope.messageForm.$setPristine();
  }
}
