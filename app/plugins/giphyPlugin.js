var Promise = require('promise');
var request = require('request');

module.exports = function(context){
	return new Promise(function(resolve, reject){;

		var msg = context.msg;
		var io  = context.io;
		if(!msg)return resolve(context);

		// /giphy COMMAND
		var regex = / *\/giphy (.+)/;
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
					reject('A giphy could not be found with "' + giphyText + '"');
				}else {
					msg.attachments = msg.attachments || [];
					msg.attachments.push({
						type: 'giphy',
						url : json.data[0].images.fixed_width.url
					});
					io.to(context.room).emit('message', msg);
					resolve(context);
				}
				
			});
		}else{
			reject('The message should start with "/giphy" ' +
				   'and a message has to be provided after.');
		}
	});
}