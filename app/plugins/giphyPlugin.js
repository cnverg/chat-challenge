var Promise = require('promise');
var request = require('request');

module.exports = function(msg){
	return new Promise(function(resolve, reject){
		var regex = / *\/giphy (.*)/;
		if(regex.test(msg.text)){
			var giphyText = regex.exec(msg.text)[1];
			request({
				url : 'http://api.giphy.com/v1/gifs/search',
				qs  : {
					api_key: 'dc6zaTOxFJmzC',
					q      : giphyText,
					limit  : 1,
				},
				json: true
			}, function(error, response, json){
				if( error || 
					response.statusCode != 200 || 
					json.meta.status != 200 || 
					json.data.length == 0 ){

					msg.attachments = msg.attachments || [];
					msg.attachments.push({
						type: 'giphy',
						text: null
					});
					resolve(msg);

				}else {
					msg.attachments = msg.attachments || [];
					msg.attachments.push({
						type: 'giphy',
						url : json.data[0].images.fixed_width.url
					});
					resolve(msg);
				}
			});
		}else{
			resolve(msg);
		}
	});
}