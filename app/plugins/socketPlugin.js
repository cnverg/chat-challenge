var Promise = require('promise');

module.exports = {

	rename: function(context){

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

				if(nickname.length > 100){
					reject('New name is too long');
					return;
				}

				// update nickname in session
				socket.session.nickname = nickname;

				// emit to the socket for rename
				socket.emit('changeName', {
					text     : 'you have changed the name to ' + nickname,
					timestamp: new Date(),
					user     : {
						id		: socket.session.id,
						nickname: socket.session.nickname
					}
				});

				// dont bother others if change is for the same name
				if(nickname == oldNick)return; // no error 

				// send to everyone in the room
				for(var room in socket.rooms){

					// message to others for new nickname for the user
					context.socket.to(room).emit('changeName', {
						text     : oldNick + ' has renamed to ' + nickname,
						timestamp: new Date(),
						user     : {
							id		: socket.session.id,
							nickname: socket.session.nickname
						}
					});
					if(context.rooms[room] && context.rooms[room][socket.session.id]){
						context.rooms[room][socket.session.id] = nickname;
					}
				}
				// remove message so that it wont be sent
				context.msg = null;
				resolve(context);

			} else {
				reject('Message should start with "/rename" and a name has to be provided');
			}
		});
	}
}