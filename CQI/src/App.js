import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to CQI Chat! 🚀', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('User');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: username,
        text: newMessage,
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="App">
      <header className="chat-header">
        <h1>🗣️ CQI Chat</h1>
        <p>Prime Executive Tech™️</p>
      </header>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.user === username ? 'own-message' : ''}`}>
              <div className="message-header">
                <span className="username">{message.user}</span>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="username-input"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
          />
          <button type="submit" className="send-button">Send 📤</button>
        </form>
      </div>
    </div>
  );
}

export default App;