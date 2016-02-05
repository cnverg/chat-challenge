import { Inject } from '../../../utils/decorators';
import Constants from '../../../utils/constants';

@Inject('$scope', 'SocketFactory', '$state', '$stateParams')
export default class chatroomDeleteController {
  constructor($scope, SocketFactory, $state, $stateParams) {
    Object.assign(this, { $scope, socket: SocketFactory(), $state });

    $scope.chatroom = $stateParams.chatroom;
    $scope.deleteChatroom = this.deleteChatroom.bind(this);
  }

  deleteChatroom() {
    console.log(this.$scope.chatroom);
    
    this.socket.emit(Constants.chatroomDelete, this.$scope.chatroom);
    this.$state.go('^');
  }
};
