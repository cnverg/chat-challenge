import { Inject } from '../../../utils/decorators';
import Constants from '../../../utils/constants';

@Inject('$scope', 'SocketFactory', '$state')
export default class ChatroomCreateController {
  constructor($scope, SocketFactory, $state) {
    Object.assign(this, { $scope, SocketFactory, $state });

    $scope.createChatroom = this.createChatroom.bind(this);
  }

  createChatroom() {
    this.SocketFactory.emit(Constants.chatroomCreate, this.$scope.chatroom);
    this.$state.go('^');
  }
};
