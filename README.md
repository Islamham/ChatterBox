[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=ctWNML1PaTk)

[![Watch This!](https://img.youtube.com/vi/ctWNML1PaTk/0.jpg)](https://www.youtube.com/watch?v=ctWNML1PaTk)

# ChatterBox 🤖
**ChatterBox** is a next-generation web-based chat application that redefines communication through cutting-edge AI technologies. From multilingual translations and voice synthesis to quick replies and emoji recommendations, ChatterBox transforms conversations into a seamless, interactive experience. Built with modern web technologies and robust AI services, it delivers a rich, intuitive, and engaging user journey.

ChatterBox features a visually stunning Three.js-powered landing page, showcasing immersive 3D animations that captivate users from the moment they arrive.

<img src="https://github.com/user-attachments/assets/be66ff85-36a4-4798-8aaf-8348fac173c1" alt="image" width="1000"/>



## Key Features

- **User Authentication**: Secure login system to authenticate users.
- **Instant Messaging**: Send and receive messages in real-time using WebSockets.
- **Chat Room Management**: Create, join, and manage multiple chat rooms.
- **Custom User Profiles**:  Add profile photos and descriptions.
- **AI Features**:
   - *Text Translation*: Translate messages into different languages.
   - *Voice Synthesis (TTS) with NLP*: Transform text into natural, human-like speech with AWS Polly.
   - *Quick Replies*: Respond instantly with contextually relevant AI-generated suggestions.
   - *Emoji Recommendations*: Add emotion to texts with context-aware emoji suggestions.

## Workflow Details

1. **User Authentication**:
   - `login.html` provides a secure interface with client-side validation for user credentials.
   - `server.js` sanitizes inputs to prevent SQL injection and XSS, then verifies credentials with `Database.js` using salted, hashed passwords (e.g., bcrypt) for secure storage and comparison.
   - `SessionManager.js` generates unique session IDs stored in HTTP-only cookies. Middleware validates sessions on each request, enforces expirations, and prevents unauthorized access.
   - Middleware ensures secure session handling, rate-limits login attempts to prevent brute-force attacks, and invalidates sessions on logout or timeout.
   - User-friendly error messages protect against information leakage, and inputs are rigorously sanitized throughout.

2. **Chat Rooms**:
   - `server.js` uses `Database.js` to fetch chat room data, including room names, participants, and message history.
   - `app.js` (specifically `LobbyView` and `ChatView` classes) dynamically updates the DOM to display chat rooms and messages, following an MVC pattern for clean separation of concerns.
   - `index.html` serves as the main interface for viewing and navigating between chat rooms.
   - High-level objects like `Room` and `Lobby` encapsulate application state, ensuring consistency across users.
   - Event handlers in `app.js` provide interactivity for switching chat rooms and updating the application state in real-time.

3. **Messaging**:
   - `server.js` sets up a WebSocket server to handle real-time messaging, broadcasting new messages to all participants in a chat room.
   - `app.js` (specifically `ChatView` class) handles sending and receiving messages via WebSocket and updates the UI dynamically as new messages are received.
   - `Database.js` stores and retrieves messages with metadata such as timestamps and sender IDs to ensure message history is preserved.
   - REST endpoints in `server.js` allow retrieval of past messages when users join a chat room, providing a seamless chat experience.

4. **Static Files**:
   - `server.js` serves static files such as `index.html`, `login.html`, `style.css`, and `script.js`.
   - `style.css` defines the styling for the application, including layouts, fonts, and color schemes for a cohesive and user-friendly interface.
   - `script.js` sets up and manages a 3D background animation using WebGL, enhancing the application’s visual appeal while maintaining high performance.
   - JavaScript components in `script.js` include event handlers to respond to user actions and dynamically update the application state.

5. **AI Features**:
   - **Quick Replies**:  
     `aiService.js` includes the `getQuickReplies` function, which generates conversational quick replies using the MistralAI `codestral-latest` model. The input is sanitized and processed to produce concise, contextually relevant replies (1–3 words), ensuring seamless communication.  
   - **Text Translation**:  
     `aiService.js` provides a `translateText` function that leverages the MistralAI model to translate user input into a specified target language. The output is parsed to extract the translation in a clean format, allowing users to communicate across different languages effortlessly.  
   - **Emoji Suggestions**:  
     `aiService.js` includes the `generateEmoji` function, which analyzes text input and suggests a single relevant emoji using the MistralAI model. This enhances the user experience by adding expressiveness to the conversation.  
   - **Text-to-Speech Conversion**:  
     `pollyService.js` uses AWS Polly to convert text input into MP3 audio. The generated audio file is stored locally and uploaded to an S3 bucket for accessibility. The `generateSpeech` function provides a URL to the file, enabling users to playback the audio directly.  
   - **Integration**:  
     `server.js` exposes endpoints for quick replies, translation, emoji suggestions, and text-to-speech conversion. These endpoints interact with `app.js`, enabling smooth integration of AI-powered features into the application workflow.


## AI Features API Usage

### Multilingual Text Translation
- **Endpoint**: `/translate` (POST)
- **Payload**: `{ "text": "Hello", "targetLanguage": "Spanish" }`
- **Response**: `{ "translatedText": "Hola" }`
- **Model**: MistralAI

### Text-to-Speech (TTS)
- **Endpoint**: `/generate-speech` (POST)
- **Payload**: `{ "text": "Hello" }`
- **Response**: `{ "filePath": "https://s3.amazonaws.com/your-bucket/speech.mp3" }`
- **Model**: AWS Polly

### Quick Response Generation
- **Endpoint**: `/quick-replies` (POST)
- **Payload**: `{ "message": "How are you?" }`
- **Response**: `{ "replies": ["I'm good", "Doing well", "Great"] }`
- **Model**: MistralAI

### Emoji Recommendations
- **Endpoint**: `/generate-emoji` (POST)
- **Payload**: `{ "text": "I am happy" }`
- **Response**: `{ "emoji": "😊" }`
- **Model**: MistralAI

## Setup and Running the Code

### Dependencies
- Node.js (version 14.x or higher)
- MongoDB (version 4.x or higher)
- AWS SDK (version 2.1692.0)
- Express (version 4.17.1)
- WebSocket (version 8.18.0)
- Three.js (version 0.171.0)
- Langchain (version 0.3.19)

### Installation
1. Clone the repository:
   
2. Install dependencies:

        npm install

API Keys

AWS Polly: Requires AWS access key and secret access key.
MistralAI: Requires API key.
Running the Server

1. Start MongoDB:

mongod --dbpath /path/to/your/db

2. Start the server:
npm start

3. Access the application at http://localhost:3000.

Environment Variables
Create a .env file in the root directory and add the following:

AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
MISTRALAI_API_KEY=your-mistralai-api-key
