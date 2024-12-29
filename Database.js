const { MongoClient, ObjectId } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v6.3 - [API Documentation](http://mongodb.github.io/node-mongodb-native/6.3/)
 * Database wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our cpen322 app.
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		const client = new MongoClient(mongoUrl);

		client.connect()
		.then(() => {
			console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
			resolve(client.db(dbName));
		}, reject);
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
}

Database.prototype.getRooms = function(){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatrooms from `db`
			 * and resolve an array of chatrooms */

			db.collection('chatrooms').find().toArray().then((result, err) => {
				if (err) {
					reject(err)
				} else {
					resolve(result)
				}
			})
		})
	)
}

Database.prototype.getRoom = function(room_id){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatroom from `db`
			 * and resolve the result */
			
            // Check if room_id is a valid ObjectId
            if (ObjectId.isValid(room_id)) {
                // Try to find the room with room_id as ObjectId
                db.collection('chatrooms').findOne({ _id: new ObjectId(room_id) }).then((result, err) => {
                    if (err) {
                        reject(err);
                    } else if (result) {
                        resolve(result);
                    } else {
                        // If not found, try to find the room with room_id as a string
                        db.collection('chatrooms').findOne({ _id: room_id }).then((result, err) => {
                            if (err) {
                                reject(err);
                            } else if (result) {
                                resolve(result);
                            } else {
								resolve(null);
							}
                        });
                    }
                });
            } else {
                // If room_id is not a valid ObjectId, find the room with room_id as a string
                db.collection('chatrooms').findOne({ _id: String(room_id) }).then((result, err) => {
                    if (err) {
                        reject(err);
                    } else if (result) {
                        resolve(result);
                    } else {
						resolve(null);
					}
                });
            }
        })
	)
}

Database.prototype.addRoom = function(room){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			/* TODO: insert a room in the "chatrooms" collection in `db`
			 * and resolve the newly added room */

			db.collection('chatrooms').insertOne(room).then((result, err) => {
				if (err) {
					reject(err)
				} else if (room.name === null || room.name === undefined) {
					reject(new Error("room name is required"))
				} else {
					resolve(room)
				}
			})
		})
	)
}

Database.prototype.getLastConversation = function(room_id, before){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read a conversation from `db` based on the given arguments
			 * and resolve if found */

			timestamp_query = before ? before : Date.now()

			db.collection('conversations').findOne({room_id: room_id, timestamp: {$lt: timestamp_query}}, { sort: { timestamp: -1 } }).then((result, err) => {
				if (err) {
					reject(err)
				} else if (result === null) {
					resolve(null)
				} else {
					resolve(result)
				}
			})
		})
	)
}

Database.prototype.addConversation = function(conversation){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: insert a conversation in the "conversations" collection in `db`
			 * and resolve the newly added conversation */

			db.collection('conversations').insertOne(conversation).then((result, err) => {
				if (err) {
					reject(err)
				} else if (conversation.room_id === undefined || conversation.timestamp === undefined || conversation.messages === undefined) {
					reject(new Error("room_id, timestamp, and messages are required"))
				} else {
					resolve(conversation)
				}
			})
		})
	)
}

Database.prototype.getUser = function(username){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			db.collection('users').findOne({ username: username }).then((result, err) => {
				if (err) {
					reject(err)
				} else if (result === null) {
					resolve(null)
				} else {
					resolve(result)
				}
			})
		})
	)
}

Database.prototype.getLanguages = function(){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			db.collection('languages').find().toArray().then((result, err) => {
				if (err) {
					reject(err)
				} else {
					resolve(result)
				}
			})
		})
	)
}

module.exports = Database;
