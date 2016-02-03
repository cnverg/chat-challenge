import io from 'socket.io/socket.io';
import { compose } from './utils/helpers';
import { Inject } from './utils/decorators';

import chatroomConfigBuilder from './components/chatroom/chatroom.config';

const appConfig = ($provide, $stateProvider, $urlRouterProvider) => {
  const socket = io();

  $provide.provider('socket', function() {
    this.$get = () => socket;
  });

  $urlRouterProvider.otherwise('/');

  const chatConfigBuilder = (stateProvider) =>
    stateProvider.state('chat', {
      'url': '/',
      'template': '<app></app>'
    });

  const chatConfig = compose(chatroomConfigBuilder, chatConfigBuilder);

  chatConfig($stateProvider);
}

Inject('$provide', '$stateProvider', '$urlRouterProvider')(appConfig);

export default appConfig;
