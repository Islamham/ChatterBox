const cpen322 = require('./cpen322-tester.js');
const path = require('path');
const express = require('express');
const ws = require('ws');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('./Database.js');
const SessionManager = require('./SessionManager.js');
const { emitWarning } = require('process');
const { getQuickReplies, translateText, generateEmoji } = require('./aiService.js');
const { generateSpeech } = require('./pollyService.js');

var broker = new ws.Server({port: 8000}, () => {
	console.log(`${new Date()}  WebSocket Server Started. Listening on ${host}:8000`);
});

var db = new Database('mongodb://localhost:27017', 'cpen322-messenger');

var sessionManager = new SessionManager();

function logRequest(req, res, next){
	console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
	next();
}

const host = 'localhost';
const port = 3000;
const clientApp = path.join(__dirname, 'client');

// express app
let app = express();

app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
app.use(logRequest);							// logging for debug

// server-side message storage
var messages = {}
var messageBlockSize = 10
db.getRooms().then((result) => {
	result.forEach(room => {
		messages[room._id] = []
	})
})

app.route('/chat')
	.get(sessionManager.middleware, function (req, res, next){
		db.getRooms().then((result) => {
			var chatData = result.map(room => (
				{
				...room,
				messages: messages[room._id] || []
			}))
			res.json(chatData)
		})
		
	})
	.post(sessionManager.middleware, function (req, res, next){
		const data = req.body

		if(!data.name){
			res.status(400).json({error: 'malformed payload'}) //to add proper message
			return
		}

		const newRoom = {
			name: data.name,
			image: data.image || "assets/everyone-icon.png"
		}

		db.addRoom(newRoom).then((result) => {
			messages[result._id] = []
			res.status(200).json(result)
		})

	})

app.route('/chat/:room_id')
	.get(sessionManager.middleware, function (req, res, next){
		const roomId = req.params.room_id;
	
		db.getRoom(roomId)
			.then(room => {
				if (room) {
					res.json(room);
				} else {
					res.status(404).json({ error: `Room ${roomId} was not found` });
				}
			})
			.catch(err => {
				res.status(500).json({ error: 'Internal Server Error' });
			});
	});

app.route('/chat/:room_id/messages')
	.get(sessionManager.middleware, function (req, res, next){
		const roomId = req.params.room_id;
		const before = Number(req.query.before) || Date.now(); //convert to number
		
		db.getLastConversation(roomId,before).then( (result, err) => {
			if (err) {
				res.status(500).json({ error: 'Internal Server Error' });
			} else {
				res.json(result);
			}
		})
	})

app.route('/login')
	.post(function (req, res, next){

		db.getUser(req.body.username).then((result) => {
			if (result === null) {
				res.redirect('/login')
			} else if (isCorrectPassword(req.body.password, result.password)) {
				sessionManager.createSession(res, req.body.username)
				res.redirect('/')
			} else {
				res.redirect('/login')
			}
		})
	})

app.route('/profile')
	.get(sessionManager.middleware, function (req, res, next){
		res.json({username: req.username})
	})	

app.route('/logout/')
	.get(function (req, res, next){
		sessionManager.deleteSession(req)
		res.redirect('/login')
	})
	
app.route('/quick-replies')
	.post(sessionManager.middleware, async function (req, res, next) {
		const message = req.body.message;
		if (!message) {
			res.status(400).json({ error: 'Message is required' });
			return;
		}
		try {
			const replies = await getQuickReplies(message);
			console.log(`Generated Quick Replies: ${replies}`);
			res.json({ replies });
		} catch (error) {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

app.route('/translate')
	.post(sessionManager.middleware, async function (req, res, next) {
		const { text, targetLanguage } = req.body;
		if (!text || !targetLanguage) {
			res.status(400).json({ error: 'Text and target language are required' });
			return;
		}
		try {
			const translatedText = await translateText(text, targetLanguage);
			res.json({ translatedText });
		} catch (error) {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

app.route('/languages')
	.get(sessionManager.middleware, function (req, res, next){
		db.getLanguages().then((result) => {
			res.json(result)
		}).catch((err) => {
			res.status(500).json({ error: 'Internal Server Error' });
		})
	})

app.route('/generate-emoji')
	.post(sessionManager.middleware, async function (req, res, next) {
		const message = req.body.text;
		if (!message) {
			res.status(400).json({ error: 'Message is required' });
			return;
		}
		try {
			const emoji = await generateEmoji(message);
			console.log(`Generated Emoji: ${emoji}`);
			res.json({ emoji });
		} catch (error) {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

app.route('/generate-speech')
    .post(sessionManager.middleware, async function (req, res, next) {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }
        try {
            const filePath = await generateSpeech(text);
            res.json({ filePath });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

broker.on('connection', (socket, req) => {
	sessionManager.middleware(req, null, (err) => {
		if (err) {
			socket.close(1008, err.message);
		}
	})

	socket.on('message', (data) => {
		var room = JSON.parse(data)
		room.username = req.username
		room.text = sanitize(room.text)
		var roomMessages = messages[room.roomId]
		console.log(`Received message: ${room.roomId} ${room.username} ${room.text}`);
		roomMessages.push({username: room.username, text: room.text});
		if (roomMessages.length === messageBlockSize) {
			conversation = {
				room_id: room.roomId,
				timestamp: Date.now(),
				messages: roomMessages
			}
			db.addConversation(conversation).then((result) => {
				console.log(`Saved conversation: ${result.room_id} ${result.timestamp}`);
				roomMessages.length = 0
			})
			
		}
		broker.clients.forEach(client => {
			if (client !== socket) {
				client.send(JSON.stringify(room));
			}
		});
	});
})

app.get('/app.js', sessionManager.middleware);
app.get('/index.html', sessionManager.middleware);
app.get('/index', sessionManager.middleware);
app.get('/', sessionManager.middleware);

// Custom error handler
app.use((err, req, res, next) => {
    if (err instanceof SessionManager.Error) {
		console.log
        if (req.headers.accept === 'application/json') {
            res.status(401).json({ error: err.message });
        } else {
            res.redirect('/login');
        }
    } else {
        res.status(500).send('Internal Server Error');
    }
});

// Helper function to check if the password is correct
function isCorrectPassword(password, saltedHash){

    // Extract the salt (first 20 characters)
    const salt = saltedHash.slice(0, 20);
    
    // Extract the hash part (remaining 44 characters)
    const storedHash = saltedHash.slice(20);
    
    // Compute the SHA256 hash of the concatenation of the password and the salt
    const hash = crypto.createHash('sha256').update(password + salt).digest('base64');
    
    // Compare the computed hash with the stored hash
    return hash === storedHash;
}

function sanitize(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',  // Backtick
        '=': '&#x3D;',  // Equal sign
        '(': '&#40;',   // Left parenthesis
        ')': '&#41;',   // Right parenthesis
    };

    const reg = /[&<>"'/`=()]/g;

    // Escape special characters
    let sanitized = input.replace(reg, (char) => map[char]);


    return sanitized;
}



// serve static files (client-side)
app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.listen(port, () => {
	console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
});

cpen322.connect('http://3.98.223.41/cpen322/test-a5-server.js');
cpen322.export(__filename, { app, broker, messages, messageBlockSize, db, sessionManager, isCorrectPassword, translateText, generateEmoji });