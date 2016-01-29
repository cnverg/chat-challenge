var Promise = require('promise');

function func1 (arg1, arg2) {
	return new Promise(function(resolve, reject){
		console.log("Run func 1");
		resolve(arg1, arg2);
	});
}
function func2 (arg1, arg2) {
	return new Promise(function(resolve, reject){
		a.b();
		reject(arg1, arg2);
	});
}


func2(1,2).catch(function(a,b){
	console.log(a instanceof Error);
})