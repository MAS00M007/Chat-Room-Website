// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSgoo-ubgabnfYJYhflLBR75JljrUmQbA",
  authDomain: "chat-website-68853.firebaseapp.com",
  projectId: "chat-website-68853",
  storageBucket: "chat-website-68853.appspot.com",
  messagingSenderId: "654439557905",
  appId: "1:654439557905:web:5cb26c9d18f971d78cfab0",
  measurementId: "G-5C1JJV8N2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname');
const roomIdInput = document.getElementById('room-id');
const createRoomBtn = document.getElementById('create-room');
const chatHeader = document.getElementById('room-name');
const leaveRoomBtn = document.getElementById('leave-room');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

let nickname = '';
let roomId = '';

// Generate random Room ID
function generateRoomId() {
  const roomId = Math.random().toString(36).substring(2, 8);
  return roomId;
}

// Create New Room
createRoomBtn.addEventListener('click', () => {
  const newRoomId = generateRoomId();
  roomIdInput.value = newRoomId;
});

// Join Room
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  nickname = nicknameInput.value.trim();
  roomId = roomIdInput.value.trim();

  if (nickname && roomId) {
    loginSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    chatHeader.innerText = `Room: ${roomId}`;
    listenForMessages();
    sendSystemMessage(`${nickname} has joined the chat`);
  }
});

// Leave Room
leaveRoomBtn.addEventListener('click', () => {
  sendSystemMessage(`${nickname} has left the chat`);
  chatMessages.innerHTML = '';
  chatSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  nicknameInput.value = '';
  roomIdInput.value = '';
});

// Send Message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    addDoc(messagesRef, {
      sender: nickname,
      message: message,
      timestamp: serverTimestamp()
    });
    messageInput.value = '';
  }
});

// Listen for Messages
function listenForMessages() {
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  const q = query(messagesRef, orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        displayMessage(data);
      }
    });
  });
}

// Display Message
function displayMessage(data) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  const nicknameSpan = document.createElement('span');
  nicknameSpan.classList.add('nickname');
  nicknameSpan.innerText = data.sender === 'SYSTEM' ? '' : data.sender;

  const messageSpan = document.createElement('span');
  messageSpan.classList.add('text');
  messageSpan.innerText = data.message;

  const timestampSpan = document.createElement('span');
  timestampSpan.classList.add('timestamp');
  const time = data.timestamp ? new Date(data.timestamp.seconds * 1000) : new Date();
  timestampSpan.innerText = ` (${time.toLocaleTimeString()})`;

  messageDiv.appendChild(nicknameSpan);
  messageDiv.appendChild(messageSpan);
  messageDiv.appendChild(timestampSpan);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send System Message
function sendSystemMessage(message) {
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  addDoc(messagesRef, {
    sender: 'SYSTEM',
    message: message,
    timestamp: serverTimestamp()
  });
}
