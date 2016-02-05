import io from 'socket.io-client';
import { compose } from './utils/helpers';
import { Inject } from './utils/decorators';

import template from './app.html!text';
import controller from './app.controller';

import authConfigBuilder from './components/auth/auth.config';
import chatroomConfigBuilder from './components/chatroom/chatroom.config';

const appConfig = ($provide, $stateProvider, $urlRouterProvider) => {
  const socket = io();

  $provide.provider('socket', function() {
    this.$get = () => socket;
  });

  $urlRouterProvider.otherwise('/');

  const chatConfigBuilder = (stateProvider) =>
    stateProvider.state('chat', {
      template,
      controller,
      'url': '/',
    });

  const chatConfig = compose(chatroomConfigBuilder, chatConfigBuilder, authConfigBuilder);

  chatConfig($stateProvider);
}

Inject('$provide', '$stateProvider', '$urlRouterProvider')(appConfig);

export default appConfig;
