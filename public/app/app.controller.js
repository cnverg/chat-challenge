import { Inject } from './utils/decorators';

@Inject('$scope', 'socket')
export default class AppController {
  constructor($scope, socket) {
    this.$scope = $scope;
    this.$socket = socket;

    this.$socket.on('message', () => {
      console.log("message received");
    });

    $scope.send = this.send.bind(this);
    $scope.join = this.join.bind(this);
    $scope.leave = this.leave.bind(this);
  }

  join(room) {
    this.$socket.emit('join', room);
  }

  leave(room) {
    this.$socket.emit('leave', room);
  }

  send(room, message) {
    this.$socket.emit('send', {
      room: room,
      message: message
    });
  }

  handleMessage(content) {
    console.log(content);
  }
};
