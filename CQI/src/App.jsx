import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import SettingsPanel from './components/SettingsPanel';
import CallDirectory from './components/CallDirectory';
import './app.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('global');
  const [pfpUrl, setPfpUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [pendingOutgoing, setPendingOutgoing] = useState([]);
  const [friendInput, setFriendInput] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalls, setShowCalls] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };
    loadSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setPfpUrl(data.avatar_url);
        setDisplayName(data.display_name || 'Anonymous');
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (tab === 'global') {
      const loadMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('message, sender_id, timestamp, profile:sender_id(avatar_url, display_name)')
          .order('timestamp');
        setMessages(data || []);
      };
      loadMessages();

      const channel = supabase
        .channel('global-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }

    if (tab === 'private' && selectedChatId) {
      const loadPrivate = async () => {
        const { data } = await supabase
          .from('private_messages')
          .select('message, sender_id, timestamp, chat_id, profile:sender_id(avatar_url, display_name)')
          .eq('chat_id', selectedChatId)
          .order('timestamp');
        setPrivateMessages(data || []);
      };
      loadPrivate();

      const channel = supabase
        .channel(`private-${selectedChatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, (payload) => {
          setPrivateMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [tab, selectedChatId, user]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (tab === 'global') {
      await supabase.from('messages').insert({
        message,
        sender_id: user.id,
      });
    } else if (tab === 'private' && selectedChatId) {
      await supabase.from('private_messages').insert({
        message,
        sender_id: user.id,
        chat_id: selectedChatId,
      });
    }

    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages]);

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="login-screen">
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Login with Google</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <img className="pfp" src={pfpUrl} alt="pfp" />
        <div className="username">{displayName}</div>
        <button onClick={() => setTab('global')}>🌐 Global Chat</button>
        <button onClick={() => setTab('private')}>👥 Private</button>
        <button onClick={() => setShowSettings(!showSettings)}>⚙️ Settings</button>
        <button onClick={() => setShowCalls(!showCalls)}>📞 Calls</button>
        <button onClick={() => supabase.auth.signOut()}>🚪 Logout</button>
      </div>

      <div className="main-chat">
        {(tab === 'global' ? messages : privateMessages).map((msg, i) => (
          <div
            className={`chat-bubble ${msg.sender_id === user.id ? 'own' : ''}`}
            key={i}
          >
            <img className="chat-avatar" src={msg.profile?.avatar_url} alt="pfp" />
            <div>
              <div className="chat-name">{msg.profile?.display_name}</div>
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-box">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {showSettings && <SettingsPanel user={user} />}
      {showCalls && <CallDirectory user={user} />}
    </div>
  );
}
