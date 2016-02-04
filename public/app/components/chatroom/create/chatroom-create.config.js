import template from './chatroom-create.html!text';
import controller from './chatroom-create.controller';

export default function chatroomCreateConfigBuilder(stateProvider) {
  return stateProvider.state('chat.roomCreate', {
    template,
    controller,
    url: 'room-create/'
  });
};
