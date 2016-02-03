import { User } from './models/user';
import { Inject } from './utils/decorators';
import Constants from './utils/constants'

const deepEquals = (ob1, ob2) => JSON.stringify(ob1) === JSON.stringify(ob2);

@Inject('$scope', 'socket', '$cookies', 'GravatarFactory', '$state')
export default class AppController {
  constructor($scope, socket, $cookies, GravatarFactory, $state) {
    $scope.selectedTarget = '';

    Object.assign(this, { $scope, socket, $cookies, GravatarFactory, $state });
    $scope.user = this.cookieUser;

    if ($scope.user.isValid)
      this.socket.emit(Constants.userEnter, $scope.user);

    this.socket.on(Constants.userUpdate, (users) => {
      $scope.$apply(() => {
        $scope.users = users;
      });
    });

    this.socket.on(Constants.roomUpdate, (rooms) => {
      $scope.$apply(() => {
        $scope.rooms = rooms;
      });
    });

    $scope.logIn = this.logIn.bind(this);
    $scope.logOut = this.logOut.bind(this);

    $scope.notCurrentUser = (user) => user.id !== this.$scope.user.id;
  }

  get cookieUser() {
    const userString = this.$cookies.get(Constants.userCookie) || '{}';
    return JSON.parse(userString);
  }

  logIn() {
    const user = new User(this.$scope.formUsername, this.$scope.formEmail, this.GravatarFactory.getUrl(this.$scope.formEmail));
    this.$cookies.put(Constants.userCookie, JSON.stringify(user));
    this.$scope.user = this.cookieUser;

    this.socket.emit(Constants.userEnter, this.$scope.user);
  }

  logOut() {
    this.socket.emit(Constants.userLeave, this.$scope.user);

    this.$cookies.remove(Constants.userCookie);
    this.$scope.user = {};

    this.$state.go('chat');
  }
};
