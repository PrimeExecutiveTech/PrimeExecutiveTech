import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function SettingsPanel({ user }) {
  const [displayName, setDisplayName] = useState(user.user_metadata?.full_name || '');
  const [pfpUrl, setPfpUrl] = useState(user.user_metadata?.avatar_url || '');
  const [status, setStatus] = useState(null);

  const saveSettings = async () => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        avatar_url: pfpUrl,
      },
    });

    if (error) {
      setStatus(`❌ ${error.message}`);
    } else {
      setStatus('✅ Settings saved!');
    }
  };

  return (
    <div className="settings-panel">
      <h2>🛠 Settings</h2>

      <label>Display Name</label>
      <input
        type="text"
        className="message-input"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Enter your display name"
      />

      <label>Profile Picture URL</label>
      <input
        type="text"
        className="message-input"
        value={pfpUrl}
        onChange={(e) => setPfpUrl(e.target.value)}
        placeholder="https://example.com/image.png"
      />

      <button className="send-button" onClick={saveSettings}>Save</button>
      {status && <p style={{ marginTop: '10px', color: '#fff' }}>{status}</p>}
    </div>
  );
}
