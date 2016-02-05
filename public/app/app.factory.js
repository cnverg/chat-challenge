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
        ? compose(apply(resolve, putUserForCookie), buildUserFrom.bind(undefined, username, email))
        : compose(reject, Error.bind(Error, "User is already logged in."))).call());

  const logout = () =>
    new Promise((resolve, reject) =>
      (get().isValid
        ? compose(apply(resolve, removeUserFromCookie))
        : compose(reject, Error.bind(Error, "User is not logged in."))).call(get()));

  return {
    get,
    login,
    logout
  };
}

const SocketFactory = (socket, $rootScope) => {
  class ScopedSocket {
    constructor(scope) {
      Object.assign(this, { scope, listeners: [] });
    }

    removeAllListeners() {
      this.listeners.forEach(listener => {
        this.removeListener(listener.event);
      });

      this.listeners = [];
    }

    removeListener(evt) {
      const listener = this.listeners.filter(({ event }) => event == evt)[0];

      if (listener) {
        socket.removeListener(listener.event, listener.fn);
        this.listeners.splice(this.listeners.indexOf(listener), 1);
      }
    }

    on(event, callback) {
      if (this.listeners.some(listener => listener.event === event))
        this.removeListener(event);

      const $scope = this.scope;
      const fn = compose($scope.$apply.bind($scope), lazy(callback));

      this.listeners.push({ event, fn });
      socket.on(event, fn);

      return this;
    }

    emit(event, ...args) {
      socket.emit(event, ...args);
      return this;
    }
  }

  const scopedSocket = new ScopedSocket($rootScope);

  return function() {
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
    'giphy', 'g'
  ];

  return function( user) {
    const scopedSocket = SocketFactory();

    const matchMessageType = ({ command, text }) => (content) => {
      const cmdPatterns = commands.map(c => new RegExp(`^\/(${c}) (.+)`));

      for (let pattern of cmdPatterns) {
        if (pattern.test(content)) {
          const [cmd, args] = content.match(pattern).slice(1);
          return command(cmd, args);
        }
      }

      return text(content);
    };

    const handleCommand = (command, content) => {
      switch(command) {
        case 'giphy': case 'g':
          return GiphyFactory.single(content).then(({ data }) => {
            const imageUrl = data.fixed_height_downsampled_url;
            const sourceUrl = data.url;

            return imageUrl && sourceUrl
              ? { imageData: { imageUrl, sourceUrl, name: content } }
              : { status: 404 };
          });
        default:
          throw Error(`Invalid command ${command}`);
      }
    }

    return {
      send(room, message) {
        const handleText = (text) => new Promise((resolve) => resolve({ text }));
        const pipeline = matchMessageType({ text: handleText, command: handleCommand });

        return pipeline(message).then(({ text, imageData, status = 200 }) => {
          scopedSocket.emit(Constants.send, Object.assign({}, { content: [{ text: message, imageData }], from: user, room, status }))
        });
      }
    };
  };
}

Inject('$resource')(GiphyFactory);
Inject('socket', '$cookies')(UserFactory);
Inject('socket', '$rootScope')(SocketFactory);
Inject('SocketFactory', 'GiphyFactory')(MessagingFactory);

export { UserFactory, SocketFactory, GiphyFactory, MessagingFactory };
