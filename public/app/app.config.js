import { Inject } from './utils/decorators';
import io from 'socket.io/socket.io';

const appConfig = ($provide) => {
  const socketSingleton = io();

  $provide.provider('socket', function() {
    this.$get = () => socketSingleton;
  });
}

Inject('$provide')(appConfig);

export default appConfig;
