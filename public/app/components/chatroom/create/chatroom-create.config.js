import template from './chatroom-create.html!text';
import controller from './chatroom-create.controller';

export default function chatroomCreateConfig(stateProvider) {
  return stateProvider.state('chat.roomCreate', {
    template,
    controller,
    url: 'room-create/'
  });
};
