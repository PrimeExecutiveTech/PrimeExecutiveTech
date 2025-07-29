import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ChatBox({ groupId, user }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!groupId) return;
    supabase.from('messages').select('*').eq('group_id', groupId).order('created_at').then(({ data }) => {
      setMessages(data || []);
    });
  }, [groupId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const { error } = await supabase.from('messages').insert({
      content: message,
      user_id: user.id,
      group_id: groupId,
    });
    if (!error) setMessage('');
  };

  return (
    <div className="chat-box">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message-bubble ${msg.user_id === user.id ? 'own' : ''}`}>
          {msg.content}
        </div>
      ))}
      <input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
