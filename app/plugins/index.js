var Promise = require('promise');


// load plugins
var giphyPlugin = require('./giphyPlugin');

// inti globals
var pluginRunId = 0;

module.exports = {

	// run all plugins against 'msg'
	runMessagePlugins: function (msg, plugins) { // {text : text}
		return new Promise(function(resolve, reject){
			var promise = metaDataPlugin(msg);
			(plugins || []).forEach(function(plugin){
				promise = promise.then(plugin);
			});
			promise.then(function(msg){
				resolve(msg);
			})
		});
	},

	// plugins list
	allPlugins: [
		giphyPlugin
	],

	// plugins map
	giphyPlugin: giphyPlugin,
}

// default plugin
function metaDataPlugin(msg){
	return new Promise(function(resolve, reject){
		msg.timestamp = new Date();
		msg.id        = new Date().getTime() + '' + (++pluginRunId);
		resolve(msg);
	});
}
