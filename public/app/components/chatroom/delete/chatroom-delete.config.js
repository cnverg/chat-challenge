import template from './chatroom-delete.html!text';
import controller from './chatroom-delete.controller';

export default function chatroomDeleteConfig(stateProvider) {
  return stateProvider.state('chat.roomDelete', {
    template,
    controller,
    url: 'room-delete/{chatroom}/'
  });
};
