var Promise = require('promise');


// load plugins
var giphyPlugin  = require('./giphyPlugin');
var socketPlugin = require('./socketPlugin');

// inti globals
var pluginRunId = 0;

module.exports = {

	// run all plugins against 'context'
	runPlugins: function (context, plugins) { // {text : text}
		return new Promise(function(resolve, reject){
			var promise = metaDataPlugin(context);
			
			(plugins || []).forEach(function(plugin){
				promise = promise.then(plugin);
			});
			promise.then(function(context){
				resolve(context);
			})
		});
	},

	// plugins list
	allPlugins: [
		giphyPlugin,
		socketPlugin
	],

	// plugins map
	giphyPlugin : giphyPlugin,
	socketPlugin: socketPlugin,
}

// default plugin
function metaDataPlugin(context){
	return new Promise(function(resolve, reject){
		var msg = context.msg;
		if(!msg)return resolve(context);
		msg.timestamp = new Date();
		msg.id    = new Date().getTime() + '' + (++pluginRunId);
		resolve(context);
	});
}
