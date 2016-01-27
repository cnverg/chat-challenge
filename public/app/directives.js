/*globals angular*/
(function(){ 'use strict'

	angular.module('chatApp').directive('eventsViewer', 
		function(){
			return {
				restrict : 'E',
				scope    : {
					events: '='
				},
				templateUrl : 'app/templates/eventsViewer.html',
				controller: function($scope, $element, $attrs){
					$scope.element = $element;
					var scroller = $($element).children('.messagesScroller');
					$scope.$watch(
						function(){
							return $(scroller)[0].scrollHeight;
						}, 
						function(nv){
							$(scroller).animate({ scrollTop: nv }, "slow");
						}
					);
				}
			};
		}
	);


	angular.module('chatApp').directive('messageViewer', 
		function(){
			return {
				restrict : 'E',
				scope    : {
					message: '='
				},
				transclude: true,
				templateUrl : 'app/templates/messageViewer.html',
				controller: function($scope, $element, $attrs){
					this.getMessage = function(){
						return $scope.message;
					}
					this.getElement = function(){
						return $element;
					}
				}
			};
		}
	);


	angular.module('chatApp').directive('giphyPlugin', function($http){
		return {
			require: '^messageViewer',
			link   : function(scope, element, attrs, msgCtrl){
				var regex = / *\/giphy (.*)/i;
				var msg = msgCtrl.getMessage();
				if(regex.test(msg.message)){
					var giphyMessage = regex.exec(msg.message)[0];
					$http.get(
						'http://api.giphy.com/v1/gifs/search',
						{
							params: {
								q: giphyMessage,
								api_key: 'dc6zaTOxFJmzC',
								limit: 1
							}
						}
					).then(function(resp){
						if(resp.status == 200 && resp.data.meta.status == 200 && 
						   resp.data.data.length == 1){
							var giphy = resp.data.data[0];
							var elem = msgCtrl.getElement();
							var picHolder = $($(elem).find('.media-body'));
							var newElem = $('<br/><img src="' + giphy.images.fixed_width.url + '" />');
							picHolder.append(newElem);
						}
					});
				}
			}
		}
	});

})();