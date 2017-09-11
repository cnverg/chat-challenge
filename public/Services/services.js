﻿app.constant('Globals', {
    socketURL: 'http://localhost:3000',
    giphyURL: 'http://api.giphy.com/v1/gifs/search?q=',
    giphyAPIKey: '&api_key=dc6zaTOxFJmzC&limit=1'
});


//
//Socket Factory to provide sockets methods
//

app.factory('socketFactory', function ($rootScope, Globals) {
    var socket = io.connect(Globals.socketURL);
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

app.factory('loginFactory', function ($rootScope, $cookies) {
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

app.factory('giphyFactory', function($http, Globals) {
    return{
        
        isGiphyRequest: function(msg) {
            return msg.indexOf('/giphy') != -1;
        },
        getSearchTerm: function (msg) {
            console.log(msg.split('/giphy')[1]);
            return msg.split('/giphy')[1];
        },
        getGiphyGif: function(searchTerm, $scope, moment, room) {
            var q = searchTerm.trim().replace("'", '').split(' ');
            var url = Globals.giphyURL + q + Globals.giphyAPIKey;
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
