import io from 'socket.io/socket.io';
import { Inject } from './utils/decorators';

const appConfig = ($provide, $stateProvider, $urlRouterProvider) => {
  const socketSingleton = io();

  $provide.provider('socket', function() {
    this.$get = () => socketSingleton;
  });

  $urlRouterProvider.otherwise('/');

  $stateProvider.state('chat', {
    url: '/',
    template: '<app></app>'
  }).state('chat.private', {
    url: 'private/{userId}'
  }).state('chat.room', {
    url: 'room/{roomId}'
  });
}

Inject('$provide', '$stateProvider', '$urlRouterProvider')(appConfig);

export default appConfig;
