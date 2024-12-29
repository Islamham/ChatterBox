const crypto = require('crypto');

class SessionError extends Error {};

function SessionManager (){
	// default session length - you might want to
	// set this to something small during development
	const CookieMaxAgeMs = 600000;

	// keeping the session data inside a closure to keep them protected
	const sessions = {};

	// might be worth thinking about why we create these functions
	// as anonymous functions (per each instance) and not as prototype methods
	this.createSession = (response, username, maxAge = CookieMaxAgeMs) => {
		const token = crypto.randomBytes(32).toString('hex')
		sessions[token] = {
			username: username,
			timestamp: Date.now()
		}

		setTimeout(() => {
			delete sessions[token];
		}, maxAge);

		response.cookie('cpen322-session', token, {maxAge: maxAge})
	};

	this.deleteSession = (request) => {

		delete request.username
		delete sessions[request.session]
		delete request.session
	};

	this.middleware = (request, response, next) => {

		// Read the cookie information from the request headers
		const cookieHeader = request.headers.cookie

		if (cookieHeader == null){
			next(new SessionError('No cookie header found.'))
			return
		}

		// Parse the cookie string to extract the session token
		const cookies = Object.fromEntries(cookieHeader.split('; ').map(cookie => cookie.split('=')));
		console.log(cookies)
		console.log(sessions)
		const token = cookies['cpen322-session']
		if (!(token in sessions)) {
			next(new SessionError('Invalid session token.'))
			return
		}

		// Assign the username and session token to the request object
		request.username = sessions[token].username;
		request.session = token;

		next()
	};

	// this function is used by the test script.
	// you can use it if you want.
	this.getUsername = (token) => ((token in sessions) ? sessions[token].username : null);
};

// SessionError class is available to other modules as "SessionManager.Error"
SessionManager.Error = SessionError;

module.exports = SessionManager;