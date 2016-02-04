import { compose } from '../../utils/helpers';
import LoginConfigBuilder from './login/login.config';
import LogoutConfigBuilder from './logout/logout.config';

const AuthConfigBuilder = (stateProvider) =>
  stateProvider.state('auth', {
    url: '/auth',
    abstract: true,
    template: '<div ui-view></div>',
  });

const AuthConfig = compose(LogoutConfigBuilder, LoginConfigBuilder, AuthConfigBuilder);

export default AuthConfig;