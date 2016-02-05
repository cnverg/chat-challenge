import controller from './logout.controller';

export default function logoutConfigBuilder(stateProvider) {
  return stateProvider.state('auth.logout', {
    controller,
    url: '/logout'
  });
}
