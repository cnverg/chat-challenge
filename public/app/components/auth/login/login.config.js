import template from './login.html!text';
import controller from './login.controller';

export default function loginConfigBuilder(stateProvider) {
  return stateProvider.state('auth.login', {
    template,
    controller,
    url: '/login'
  });
}
