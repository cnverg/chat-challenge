import Constants from '../../../utils/constants';
import { Inject } from '../../../utils/decorators';

@Inject('$scope', '$state', 'UserFactory')
export default class LoginController {
  constructor($scope, $state, UserFactory) {
    Object.assign(this, { $scope, $state, UserFactory });
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
