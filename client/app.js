////////////////////////////////////////
// Global Objects
////////////////////////////////////////

var Service = {
    origin: window.location.origin,
    getAllRooms: function() {
        return fetch(Service.origin + "/chat")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
                }
                //console.log(res.json())
                return res.json();
            })
            .catch(err => Promise.reject(err));
    },
    addRoom: function(data) {
        return fetch(Service.origin + "/chat", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
            }
            return res.json();
        })
        .catch(err => Promise.reject(err));
    },
    getLastConversation: function(roomId, before) {
        return fetch(Service.origin + `/chat/${roomId}/messages?before=${before}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
                }
                return res.json();
            })
            .catch(err => Promise.reject(err));
    },
    getProfile: function() {
        return fetch(Service.origin + "/profile")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
                }
                return res.json();
            })
            .catch(err => Promise.reject(err));
    },
    getQuickReplies: function(message) {
        return fetch(Service.origin + "/quick-replies", {
            method: "POST",
            body: JSON.stringify({ message }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
            }
            return res.json();
        })
        .catch(err => Promise.reject(err));
    },
    getTranslatedMessage: function(text, targetLanguage) {
        return fetch(Service.origin + "/translate", {
            method: "POST",
            body: JSON.stringify({ text, targetLanguage }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
            }
            return res.json();
        })
        .catch(err => Promise.reject(err));
    },
    getLanguages: function() { 
        return fetch(Service.origin + "/languages")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
                }
                return res.json();
            })
            .catch(err => Promise.reject(err));
    },
    generateEmoji: function(text) {
        return fetch(Service.origin + "/generate-emoji", {
            method: "POST",
            body: JSON.stringify({ text }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
            }
            return res.json();
        })
        .catch(err => Promise.reject(err));
    },
    generateSpeech: function(text) {
        return fetch(Service.origin + "/generate-speech", {
            method: "POST",
            body: JSON.stringify({ text }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server Error ${res.status}: ` + Service.origin.split('error/')[1]);
            }
            return res.json();
        })
        .catch(err => Promise.reject(err));
    }
};

////////////////////////////////////////
// Global Variables
////////////////////////////////////////

var profile = {
    username: "Alice"
}

////////////////////////////////////////
// Model Classes
////////////////////////////////////////

class Room {
    constructor(id,name,image="assets/everyone-icon.png",messages = []){
        this.id = id
        this.name = name
        this.image = image
        this.messages = messages
        this.onNewMessage = null
        this.getLastConversation = makeConversationLoader(this)
        this.canLoadConversation = true
    }

    addMessage(username, text){
        if (text.trim() === "") {
            return
        } else {
            var message = new Message(username, text)
            this.messages.push(message)
            if (this.onNewMessage){
                this.onNewMessage(message)
            }
        }
    }

    addConversation(conversation){

        console.log(conversation)
        console.log(this.messages)

        this.messages = [...this.messages, ...conversation.messages]
        console.log(this.messages)
        
        this.onFetchConversation(conversation)
    }
}

class Lobby{
    constructor(){
        this.rooms = {}
        this.onNewRoom = null
    
    }

    getRoom(roomId){
        return this.rooms[roomId] ? this.rooms[roomId] : null
    }

    addRoom(id, name, image, messages){
        this.rooms[id] = new Room(id, name, image, messages)
        if (this.onNewRoom){
            this.onNewRoom(this.rooms[id])
        }
    }

}

////////////////////////////////////////
// View Classes
////////////////////////////////////////

class LobbyView {
    constructor(lobby){
        this.elem = createDOM(lobbyContent)
        this.listElem = this.elem.querySelector('.room-list')
        this.inputElem = this.elem.querySelector('input')
        this.buttonElem = this.elem.querySelector('button')
        this.lobby = lobby

        // Initial rendering of the list
        this.redrawList()

        // Add event listener to the button
        this.buttonElem.addEventListener('click', () => {
            const name = this.inputElem.value
            if (name.trim() === "") {
                return
            } else {
                Service.addRoom({name: name, image: ""})
                    .then(res => {
                        this.lobby.addRoom(res._id, res.name, res.image, [])
                        this.inputElem.value = ""
                    })
                    .catch(error => {
                        console.error('Error adding room:', error)
                    })
            }
        })

        // Add "simple" event listener to the lobby
        this.lobby.onNewRoom = (room) => {
            this.listElem.appendChild(createDOM(`<li><a href="#/chat/${room.id}">${room.name}</a></li>`))
        }

    }

    redrawList() {
        emptyDOM(this.listElem)
        for (let [key, value] of Object.entries(this.lobby.rooms)) {
            let roomElem = createDOM(`<li><a href="#/chat/${key}">${value.name}</a></li>`)
            this.listElem.appendChild(roomElem)

            // potential alternative way to create the elements

            // var a = document.createElement('a').hasAttribute('href', '#/chat')
            // a.appendChild(document.createTextNode(value.name))
            // var li = document.createElement('li').appendChild(a)
            // this.listElem.appendChild(li)

        }
    }
}

class ChatView {
    constructor(socket){
        this.elem = createDOM(chatContent)
        this.titleElem = this.elem.querySelector('.room-name')
        this.chatElem = this.elem.querySelector('.message-list')
        this.inputElem = this.elem.querySelector('textarea')
        this.buttonElem = this.elem.querySelector('button')
        this.room = null
        this.socket = socket
        this.quickRepliesElem = this.elem.querySelector('.quick-replies')
        this.emojiesElem = this.elem.querySelector('.emojies')
        this.translateButtonElem = this.elem.querySelector('.translate-button');
        this.languageSelectElem = this.elem.querySelector('#language-select');
        this.languages = [];
        this.translateCheckboxElem = this.elem.querySelector('#translate-checkbox');
        this.playSpeechCheckboxElem = this.elem.querySelector('#play-speech-checkbox');
        
        // Add event listener to the translate button
        this.translateButtonElem.addEventListener('click', () => {
            this.translateMessage();
        });
        
        // Add event listener to the button
        this.buttonElem.addEventListener('click', () => {
            this.sendMessage()
        })

        // Add keyup event listener to the input
        this.inputElem.addEventListener('keyup', (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                this.sendMessage();
            }
        })

        // Add wheel event listener to the chatElem
        this.chatElem.addEventListener('wheel', (e) => {
            //console.log("here" + this.chatElem.scrollTop)
            if (this.chatElem.scrollTop <= 0 && e.deltaY < 0 && this.room.canLoadConversation) {
                this.room.getLastConversation.next()
            }
        })

        // Add input event listener to the input
        this.inputElem.addEventListener('input', () => {
            this.handleInputChange();
        });
        
    }

    handleInputChange() {
        const text = this.inputElem.value;

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (text.trim() !== "") {
            this.timeout = setTimeout(() => {
                Service.generateEmoji(text).then(data => {
                    this.displayEmoji(data.emoji);
                }).catch(error => {
                    console.error('Error generating emoji:', error);
                });
            }, 1000);
        }
    }

    sendMessage(){
        const text = this.inputElem.value;
        if (text.trim() === "" || !this.room) {
            return;
        } else {
            var message = sanitize(text);
            this.room.addMessage(profile.username, message);
            this.socket.send(JSON.stringify({roomId: this.room.id, text: message}));
            this.inputElem.value = "";
        }
    }

    playSpeech(text) {
        Service.generateSpeech(text).then(data => {
            const audio = new Audio(data.filePath);
            setTimeout(() => {
                audio.play();
            }, 1000); 
        }).catch(error => {
            console.error('Error generating speech:', error);
        });
    }

    displayEmoji(emoji) {
        if (emoji) {
            this.emojiesElem.innerHTML = '';
            const button = document.createElement('button');
            button.className = 'emoji-button';
            button.textContent = emoji;
            button.addEventListener('click', () => {
                this.inputElem.value += emoji;
                this.emojiesElem.innerHTML = '';
            });
            this.emojiesElem.appendChild(button);
        } else {
            this.emojiesElem.innerHTML = '';
        }
    }

    displayQuickReplies(replies) {
        console.log(replies)
        this.quickRepliesElem.innerHTML = '';
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-button';
            button.textContent = reply;
            button.addEventListener('click', () => {
                this.inputElem.value = reply;
                this.sendMessage();
            });
            this.quickRepliesElem.appendChild(button);
        });
    }

    translateMessage() {
        const text = this.inputElem.value;
        const targetLanguage = this.languageSelectElem.value;
        if (text.trim() === "" || !targetLanguage) {
            return;
        } else {
            Service.getTranslatedMessage(text, targetLanguage).then(data => {
                this.inputElem.value = "";
                this.inputElem.value = data.translatedText;
            }).catch(error => {
                console.error('Error translating message:', error);
            });


            // fetch('/translate', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ text, targetLanguage })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     this.inputElem.value = data.translatedText;
            // })
            // .catch(error => console.error('Error translating message:', error));
        }
    }

    setRoom(room){
        this.room = room
        this.titleElem.textContent = room.name
        this.chatElem.innerHTML = ""
        this.room.messages.forEach(message => {
            const messageClass = message.username === profile.username ? 'message my-message' : 'message'
            this.chatElem.appendChild(createDOM(
                `<div class="${messageClass}">
                    <span class="message-user">${message.username}</span>
                    <span class="message-text">${message.text}</span>
                </div>`
            ))
        })
        this.room.onNewMessage = (message) => {
            const isCurrUser = message.username === profile.username
            const messageClass = isCurrUser ? 'message my-message' : 'message'
            console.log(isCurrUser)
            var translatedMessage = '';
            var targetLanguage = this.languageSelectElem.value ? this.languageSelectElem.value : 'English';
            if (!isCurrUser && this.translateCheckboxElem.checked) {
                Service.getTranslatedMessage(message.text, targetLanguage).then(data => {
                    console.log(data.translatedText)
                    translatedMessage = data.translatedText;
                    this.chatElem.appendChild(createDOM(
                        `<div class="${messageClass}">
                            <span class="message-user">${message.username}</span>
                            <span class="message-text">${translatedMessage}</span>
                        </div>`
                    ));
                    Service.getQuickReplies(translatedMessage).then(data => {   
                        this.displayQuickReplies(data.replies) 
                    }).catch(error => { 
                        console.error('Error fetching quick replies:', error)
                    })
                    this.quickRepliesElem.innerHTML = '';
                    if (this.playSpeechCheckboxElem.checked) {
                        this.playSpeech(translatedMessage);
                    }
                }).catch(error => {
                    console.error('Error translating message:', error);
                }); 

            } else {
                this.chatElem.appendChild(createDOM(
                    `<div class="${messageClass}">
                        <span class="message-user">${message.username}</span>
                        <span class="message-text">${message.text}</span>
                    </div>`
                ))
                if (!isCurrUser) {
                    Service.getQuickReplies(message.text).then(data => {   
                        this.displayQuickReplies(data.replies) 
                    }).catch(error => { 
                        console.error('Error fetching quick replies:', error)
                    })
                } else {
                    this.quickRepliesElem.innerHTML = '';
                }
                if (this.playSpeechCheckboxElem.checked) {
                    this.playSpeech(message.text);
                }
            }

        }
        this.room.onFetchConversation = (conversation) => {
            const oldScrollHeight = this.chatElem.scrollHeight;

            conversation.messages.slice().reverse().forEach(message => {
                const messageClass = message.username === profile.username ? 'message my-message' : 'message';
                this.chatElem.insertBefore(createDOM(
                    `<div class="${messageClass}">
                        <span class="message-user">${message.username}</span>
                        <span class="message-text">${message.text}</span>
                    </div>`
                ), this.chatElem.firstChild);
            });

            const newScrollHeight = this.chatElem.scrollHeight;
            this.chatElem.scrollTop = newScrollHeight - oldScrollHeight;
        }   
        this.languages = Service.getLanguages().then(data => {
            console.log(data);
            this.languages = data;
            this.languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language.name;
                option.textContent = language.name;
                this.languageSelectElem.appendChild(option);
            });
        }).catch(error => {
            console.error('Error fetching languages:', error);
        });
    }
}

class ProfileView {
    constructor(){
        this.elem = createDOM(profileContent)

    }
}

////////////////////////////////////////
// Other Classes
////////////////////////////////////////

class Message {
    constructor(username, text) {
        this.username = username
        this.text = text
    }
}

////////////////////////////////////////
// Helper functions
////////////////////////////////////////

// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild)
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
    let template = document.createElement('template')
    template.innerHTML = htmlString.trim()
    return template.content.firstChild
}

function* makeConversationLoader(room){
    var timestamp = room.timestamp

    while (room.canLoadConversation){
        room.canLoadConversation = false
        yield new Promise((resolve, reject) => {
            Service.getLastConversation(room.id, timestamp)
                .then(res => {
                    if (res){
                        timestamp = res.timestamp
                        room.canLoadConversation = true
                        room.addConversation(res)
                        resolve(res)
                    } else {
                        resolve(null)
                    }                
                })
            })
    } 
    
}

function sanitize(input) {
    // const map = {
    //     '&': '&amp;',
    //     '<': '&lt;',
    //     '>': '&gt;',
    //     '"': '&quot;',
    //     "'": '&#x27;',
    //     '/': '&#x2F;',
    //     '`': '&#x60;',  // Backtick
    //     '=': '&#x3D;',  // Equal sign
    //     '(': '&#40;',   // Left parenthesis
    //     ')': '&#41;',   // Right parenthesis
    // };

    // const reg = /[&<>"'/`=()]/g;

    // // Escape special characters
    // let sanitized = input.replace(reg, (char) => map[char]);

    // return sanitized;
    return input
}



////////////////////////////////////////
// Content
////////////////////////////////////////

var lobbyContent = 
`<div class=\"content\">
  <ul class=\"room-list\">
    <li><a href=\"#/chat/1\">Everyone in CPEN400A</a></li>
    <li><a href=\"#/chat/2\">Foodies only</a></li>
    <li><a href=\"#/chat/3\">Gamers unite</a></li>
    <li><a href=\"#/chat/4\">Canucks</a></li>
  </ul>
  <div class=\"page-control\">
    <input type=\"text\">
    <button>Create Room</button>
  </div>
</div>`

var chatContent = 
`<div class="content">
    <h4 class="room-name"></h4>
    <div class="message-list">
        <div class="message">
            <span class="message-user">Professor</span>
            <span class="message-text">Hello student!</span>
        </div>
        <div class="message my-message">
            <span class="message-user">Student</span>
            <span class="message-text">Hello professor!</span>
        </div>
    </div>
    <div id="quick-replies" class="quick-replies"></div>
    <div id="emojies" class="emojies"></div>    
    <div class="page-control">
        <textarea></textarea>
        <div class= "button-container">
            <button>Send</button>
            <button class="translate-button">Translate</button>
            <select id="language-select"></select>
        </div>
        <div class="checkbox-container">
            <div class="translate-checkbox">
                <input type="checkbox" id="translate-checkbox">
                <label id="translate-checkbox-label" for="translate-checkbox">Auto-translate</label>
            </div>
            <div class="play-speech-checkbox">
                <input type="checkbox" id="play-speech-checkbox">
                <label id="play-speech-checkbox-label" for="play-speech-checkbox">Play speech</label>
            </div>
        </div>
    </div>
</div>`


var profileContent = 
`<div class="content">
    <div class="profile-form">
        <div class="form-field">
            <label>Username</label>
            <input type="text"></input>
        </div>
        <div class="form-field">
            <label>Password</label>
            <input type="password"></input>
        </div>
        <div class="form-field">
            <label>Avatar Image</label>
            <input type="file"></input>
        </div>
        <div class="form-field">
            <label>About</label>
            <input type="text"></input>
        </div>
    <div>
    <div class="page-control">
        <button>Save</button>
    </div>
</div>`


////////////////////////////////////////
// Main Function
////////////////////////////////////////

function main() {

    var lobby = new Lobby()
    var lobbyView = new LobbyView(lobby)
    var socket = new WebSocket("ws:localhost:8000")
    var chatView = new ChatView(socket) 
    var profileView = new ProfileView()  

    Service.getProfile().then(
        res => {
            profile = res;
        }
    ).catch(error => {
        console.error('Error getting profile:', error);
    });
    
    function refreshLobby(){
        Service.getAllRooms().then(
            res => {
                res.forEach(room => {               
                    let existingRoom = lobby.getRoom(room._id)
                    if (existingRoom){
                        existingRoom.name = room.name
                        existingRoom.image = room.image
                    } else {
                        lobby.addRoom(room._id, room.name, room.image, room.messages)
                    }
                })
            },
            //renderRoute() // direct navigation to chat room req renderRoute (refresh lobby interval)

        ).catch(error => {
            console.error('Error refreshing lobby:', error);
        });
    }

    function renderRoute(){

        const hashParts = window.location.hash.split('/');
        const path = hashParts[1] || ""; // Default to empty string if undefined

        var pageView = document.getElementById('page-view')
        
        if (path === ""){
            emptyDOM(pageView)
            pageView.appendChild(lobbyView.elem)
        }
        else if (path === "chat"){
            const roomId = window.location.hash.split('/')[2]
            var room = lobby.getRoom(roomId)
            if (room){
                chatView.setRoom(room)
            }
            emptyDOM(pageView)
            pageView.appendChild(chatView.elem)
        }
        else if (path === "profile"){
            emptyDOM(pageView)
            pageView.appendChild(profileView.elem)
        }
    }

    refreshLobby()
    renderRoute()

    setInterval(refreshLobby, 5000)

    window.addEventListener('popstate', renderRoute)
    
    socket.addEventListener("message", (event) => {
        console.log(event.data)
        data = JSON.parse(event.data)
        console.log(data)
        lobby.getRoom(data.roomId).addMessage(data.username, data.text)
    })


    cpen322.export(arguments.callee, {
        renderRoute: renderRoute,
        refreshLobby: refreshLobby,
        lobbyView: lobbyView,
        chatView: chatView,
        profileView: profileView,
        lobby: lobby,
        socket: socket,
        makeConversationLoader: makeConversationLoader
    });

    //removed in task4
    //cpen322.setDefault("testRoomId", 1);
}

window.addEventListener('load', main)