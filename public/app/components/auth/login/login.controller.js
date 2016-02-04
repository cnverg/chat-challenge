import Constants from '../../../utils/constants';
import { Inject } from '../../../utils/decorators';

@Inject('$scope', '$state', 'UserFactory')
export default class LoginController {
  constructor($scope, $state, UserFactory) {
    Object.assign(this, { $scope, $state, UserFactory });

    setTimeout(() => {
      UserFactory.login('cdedios', 'c.dedios@outlook.com').then(() => {
        $state.go('chat');
      })['catch'](err => {
        console.error(err);
      });
    }, 5000);

    $scope.login = this.login.bind(this);
  }

  login(username, email) {
    this.UserFactory.login(username, email).then(() => {
      this.$state.go('chat');
    })['catch'](err => {
      console.error(err);
    });
  }
}
