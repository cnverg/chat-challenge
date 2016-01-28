var Promise = require('promise');

module.exports = function(context){

	return new Promise(function(resolve, reject){
		
		var socket = context.socket;
		var msg    = context.msg;
		if(!socket)return resolve(context);

		// /rename COMMAND
		var rename = / *\/rename (.+)/;
		if(msg && rename.test(msg.text)){
			// get newNickname
			var nickname = rename.exec(msg.text)[1];
			var oldNick = socket.session.nickname;

			// emit to the socket for rename
			socket.emit('changeName', {
				newNickname: nickname,
				oldNickName: oldNick,
				text       : 'you have changed the name to ' + nickname,
				timestamp  : new Date(),
			});

			// update nickname in session
			socket.session.nickname = nickname;

			// build message for others in chat
			if(nickname == oldNick)return;

			// send to everyone in the room
			for(var room in socket.rooms){
				context.socket.to(room).emit('action', {
					message  : oldNick + ' has renamed to ' + nickname,
					timestamp: new Date(),
				});
			}
			// remove message so that it wont be sent
			context.msg = null;
			resolve(context);

		} else {
			resolve(context);
		}
	});
}