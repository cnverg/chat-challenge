import { Inject } from './utils/decorators';
import Constants from './utils/constants';

const appRun = ($rootScope, $state, $cookies) => {
  $rootScope.$on('$stateChangeStart', (event, to, toParams, from, fromParams) => {
    const user = JSON.parse($cookies.get(Constants.userCookie) || '{}');

    if (!user.isValid && to.name != 'auth.login') {
      event.preventDefault();
      $state.go('auth.login');
    }

    if (user.isValid && to.name == 'auth.login') {
      event.preventDefault();
      $state.go('chat');      
    }
  });

}

Inject('$rootScope', '$state', '$cookies')(appRun);

export default appRun;
