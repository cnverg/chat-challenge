import md5 from 'md5';
import io from 'socket.io-client';
import { User } from './models/user';
import Constants from './utils/constants';
import { Inject } from './utils/decorators';
import { compose, apply, first, id, lazy } from './utils/helpers';

const getGravatarUrlFor = (email) => `https://www.gravatar.com/avatar?gravatar_id=${md5(email)}&d=mm`;

function UserFactory(socket, $cookies) {
  const or = (f, g) => (...args) => f(...args) || g(...args);

  const buildUserFrom = (username, email) => new User(username, email, getGravatarUrlFor(email));

  const bindToCookie = (f) => f.bind($cookies, Constants.userCookie);

  const removeUserFromCookie = bindToCookie($cookies.remove);
  const putUserForCookie = compose(bindToCookie($cookies.put), JSON.stringify);
  const get = getUserFromCookie = compose(JSON.parse, or(bindToCookie($cookies.get), () => '{}'));

  const emitUserEnter = socket.emit.bind(socket, Constants.userEnter);
  const emitUserLeave = socket.emit.bind(socket, Constants.userLeave);

  const login = (username, email) =>
    new Promise((resolve, reject) =>
      (!get().isValid
        ? compose(apply(emitUserEnter, resolve, putUserForCookie), buildUserFrom.bind(undefined, username, email))
        : compose(reject, Error.bind(Error, "User is already logged in."))).call());

  const logout = () =>
    new Promise((resolve, reject) =>
      (get().isValid
        ? compose(apply(emitUserLeave, resolve, removeUserFromCookie))
        : compose(reject, Error.bind(Error, "User is not logged in."))).call(get()));

  return {
    get,
    login,
    logout
  };
}

const SocketFactory = () => {
  class ScopedSocket {
    constructor(socket, scope) {
      Object.assign(this, { socket, scope, listeners: [] });
    }

    removeAllListeners() {
      this.listeners.forEach(listener => {
        this.socket.removeListener(listener.event, listener.fn);
      });
    }

    on(event, callback) {
      const $scope = this.scope;
      const fn = compose($scope.$apply.bind($scope), lazy(callback));

      this.listeners.push({ event, fn });
      this.socket.on(event, fn);

      return this;
    }

    emit(event, ...args) {
      this.socket.emit(event, ...args);
      return this;
    }
  }

  const socket = io.connect();

  return function(scope) {
    const scopedSocket = new ScopedSocket(socket, scope);
    scope.$on('$destroy', scopedSocket.removeAllListeners.bind(scopedSocket));
    return scopedSocket;
  }
}

const GiphyFactory = ($resource) => {
  const apiUrl = 'http://api.giphy.com/v1/gifs/random';
  const publicKey = 'dc6zaTOxFJmzC';

  const res = $resource(`${apiUrl}?api_key=${publicKey}`);

  return {
    single(tag) {
      return res.get({ tag }).$promise;
    }
  };
}

const MessagingFactory = (SocketFactory, GiphyFactory) => {
  const commands = [
    'giphy'
  ];

  return function(scope, user) {
    const scopedSocket = SocketFactory(scope);

    const match = ({ command, text }) => (content) => {
      const cmds = commands.map(c => `^\/(${c}) (.+)`);
      const commandExpression = new RegExp(cmds.join('|'));

      if (commandExpression.test(content)) {
        const [cmd, args] = content.match(commandExpression).slice(1);
        return command(cmd, args)
      } else {
        return text(content);
      }
    };

    const handleCommand = (command, content) => {
      switch(command) {
        case 'giphy':
          return GiphyFactory.single(content).then(({ data }) => {
            const imageUrl = data.fixed_height_downsampled_url;
            const sourceUrl = data.url;

            return { imageData: { imageUrl, sourceUrl, name: content } };
          });
        default:
          throw Error(`Invalid command ${command}`);
      }
    }

    return {
      send(room, message) {
        const handleText = (text) => new Promise((resolve) => resolve({ text }));
        const pipeline = match({ text: handleText, command: handleCommand });

        return pipeline(message).then(({ text, imageData }) => {
          scopedSocket.emit(Constants.send, Object.assign({}, { content: [{ text: message, imageData }], from: user, room }))
        });
      }
    };
  };
}

Inject('$resource')(GiphyFactory);
Inject('socket', '$cookies')(UserFactory);
Inject('SocketFactory', 'GiphyFactory')(MessagingFactory);

export { UserFactory, SocketFactory, GiphyFactory, MessagingFactory };
