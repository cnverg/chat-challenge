var Promise = require('promise');

module.exports = {

	rename: function(context){

		return new Promise(function(resolve, reject){
			
			var socket = context.socket;
			if(!socket)	return resolve(context);
			var msg    = context.msg;
			var session=  socket.session;
			if(!session)return reject(); // throw default error

			// /rename COMMAND
			var rename = / *\/rename (.+)/;
			if(msg && rename.test(msg.text)){
				// get newNickname
				var nickname = rename.exec(msg.text)[1];
				var oldNick = session.nickname;

				if(nickname.length > 100){
					reject('New name is too long');
					return;
				}

				// update nickname in session
				session.nickname = nickname;

				// emit to the socket for rename
				socket.emit('changeName', 
					createRenameSocketMessage(
						'you have changed the name to ' + nickname, session
					)
				);

				// dont bother others if change is for the same name
				if(nickname == oldNick)return; // no error 

				// send to everyone in the room
				for(var room in socket.rooms){

					// message to others for new nickname for the user
					context.socket.to(room).emit(
						createRenameSocketMessage(
							oldNick + ' has renamed to ' + nickname, session
						)
					);
					
					// update name in room
					if(context.rooms[room] && context.rooms[room][session.id]){
						context.rooms[room][session.id] = nickname;
					}

				}
				// remove message so that it wont be sent
				context.msg = null;
				resolve(context);

			} else {
				reject('Message should start with "/rename" and a name has to be provided');
			}
		});


		function createRenameSocketMessage(text, session){
			return {
				text     : text,
				timestamp: new Date(),
				user     : {
					id		: session.id,
					nickname: session.nickname
				}
			}
		}
	}
}