import template from './chatroom.html!text';
import { compose } from '../../utils/helpers';
import controller from './chatroom.controller';

import chatroomCreateConfigBuilder from './create/chatroom-create.config';
import chatroomDeleteConfigBuilder from './delete/chatroom-delete.config';

const chatroomConfigBuilder = (stateProvider) =>
  stateProvider.state('chat.room', {
    template,
    controller,
    url: 'room/{target}'
  });

const chatroomConfig = compose(chatroomConfigBuilder, chatroomDeleteConfigBuilder, chatroomCreateConfigBuilder);

export default chatroomConfig;
