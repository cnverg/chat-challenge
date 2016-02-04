import md5 from 'md5';
import { User } from './models/user';
import Constants from './utils/constants';
import { Inject } from './utils/decorators';
import { compose, apply, first, id } from './utils/helpers';

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

Inject('socket', '$cookies')(UserFactory);

export { UserFactory };