var Promise = require('promise');


// load plugins
var giphyPlugin  = require('./giphyPlugin');
var socketPlugin = require('./socketPlugin');

// inti globals
var pluginRunId = 0;

var plugins = module.exports = {

	// run all plugins against 'context'
	runPlugins: function (context) { // {text : text}
		return new Promise(function(resolve, reject){
			
			var msg = context.msg;
			var promise = metaDataPlugin(context);
			if(!msg)return promise.then(resolve);

			var regex = /(\/[^ ]+)/;
			if(regex.test(msg.text)){
				var command   = regex.exec(msg.text)[1];
				var plugin = plugins.map[command];
				if(plugin){
					// plugin will be applied
					promise
						.then(plugin)
						.then(resolve)
						.catch(getDefaultErrorPlugin(context))
						.then(resolve)
						.catch(reject);
				}else{
					// no plugin found with that name
					promise
						.then(uknownCommandPlugin)
						.catch(getDefaultErrorPlugin(context))
						.then(resolve)
						.catch(reject);
				}
			} else {
				promise
					.then(defaultPlugin)
					.catch(getDefaultErrorPlugin(context))
					.then(resolve)
					.catch(reject);
			}
		});
	},

	map : {
		'/giphy'  : giphyPlugin,
		'/rename' : socketPlugin.rename,
	}

}


//
// default plugins
//


// timestamp and id plugin
function metaDataPlugin(context){
	return new Promise(function(resolve, reject){
		var msg = context.msg;
		if(!msg)return resolve(context);
		msg.timestamp = new Date();
		msg.id        = new Date().getTime() + '' + (++pluginRunId);
		resolve(context);
	});
}

// a plugin that just send the message to the room
function defaultPlugin(context){
	return new Promise(function(resolve, reject){
		var msg = context.msg;
		var room= context.room;
		var io  = context.io;
		if(msg && room){
			io.to(room).emit('message', msg);
			resolve(context);
		} else {
			reject('Message cannot be empty', context);
		}
	});
}

// a plugin used when the command is not found. 
// It generates an error to notify the user
function uknownCommandPlugin(context){
	return new Promise(function(resolve, reject){
		reject('Uknown command, messages that starts with "/" are commands. ' +
			   'If you want to start with "/" try preceding the "/" with a space', context);
	});
}

// a plugin that will process errors generated as :
/*
	{
		// aditional fields could be added for logging
		message: 'This is the error to the user'
	}
*/
function getDefaultErrorPlugin(context){
	return function defaultErrorPlugin(err) {
		return new Promise(function(resolve, reject){
			if(!context)return reject(err);
			if(!context.msg)return reject(err);

			var msg = context.msg;
			var socket = context.socket;
			if(!err) err = {};
			if(typeof err == 'string'){
				err = { message: err };
			}
			if(err instanceof Error){
				err = {
					message: 'An error has occurred.',
					innerError: err
				}
			}
			msg.attachments = msg.attachments || [];
			var errMsg = err.message || 'An error has occurred.';
			msg.attachments.push({
				type   : 'error',
				message: errMsg
			});
			socket.emit('message', msg);
			resolve();
		});
	}
}
