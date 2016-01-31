
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

app.factory('GiphyFactory', function($http) {
    return{
        
        isGiphyRequest: function(msg) {
            return msg.indexOf('/giphy') != -1;
        },
        GetSearchTerm: function (msg) {
            console.log(msg.split('/giphy')[1]);
            return msg.split('/giphy')[1];
        },
        GetGiphyGif: function(searchTerm, $scope, moment, room) {
            var q = searchTerm.trim().replace("'", '').split(' ');
            var url = 'http://api.giphy.com/v1/gifs/search?q=' + q + '&api_key=dc6zaTOxFJmzC&limit=1';
            $http.get(url)
                .then(function (data) {
                    if (data.data.data) {
                        var message = data.data.data[0].images.fixed_height_small.url;
                        var type = 'image'
                        $scope.formatMessage(message, moment, type);
                        $scope.send(room, {message: message, type: type});
                        $scope.currentMessage = "";
                    }
                },
                function(data){
                    console.log(data);
                });
        }
    };
});