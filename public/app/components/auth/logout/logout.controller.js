import { Inject } from '../../../utils/decorators';

@Inject('$state', 'UserFactory')
export default class LogoutController {
  constructor($state, UserFactory) {    
    UserFactory.logout().then(() => {
      $state.go('auth.login');
    })['catch'](err => {
      console.error(err);
    });
  }
}
