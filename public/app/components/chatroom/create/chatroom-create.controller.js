import { Inject } from '../../../utils/decorators';
import Constants from '../../../utils/constants';

@Inject('$scope', 'socket', '$state')
export default class chatroomCreateController {
  constructor($scope, socket, $state) {
    Object.assign(this, { $scope, socket, $state });

    $scope.createChatroom = this.createChatroom.bind(this);
  }

  createChatroom() {
    this.socket.emit(Constants.chatroomCreate, this.$scope.chatroom);
    this.$state.go('^');
  }
};
