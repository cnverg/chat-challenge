
//
//Socket Factory to provide sockets methods
//

app.factory('SocketFactory', function ($rootScope) {
    var socket = io.connect('http://localhost:3000');
      return {

          on: function (eventName, callback) {
              socket.on(eventName, function () {
                  var args = arguments;
                  $rootScope.$apply(function () {
                      callback.apply(socket, args);
                  });
              });
          },

          emit: function (eventName, data, callback) {
              socket.emit(eventName, data, function () {
                  var args = arguments;
                  $rootScope.$apply(function () {
                      if (callback) {
                          callback.apply(socket, args);
                      }
                  });
              })
          },

          removeListeners: function() {
              socket.removeAllListeners();
          }
      };
})


//
//Login Factory to provide Login functionality
//

app.factory('LoginFactory', function ($rootScope, $cookies) {
    return {

        logIn: function (userName, callback) {
            if (!$cookies.get(userName)) $cookies.put('userName', userName);
        },

        logOut: function (userName, callback) {
            if ($cookies.get('userName')) $cookies.remove('userName');
        },

        exist: function(userName) {
            return !angular.isUndefined($cookies.get(userName));
        },

        getCurrent: function () {
            if ($cookies.get('userName')) return $cookies.get('userName');
            return false;
        }
    };
})