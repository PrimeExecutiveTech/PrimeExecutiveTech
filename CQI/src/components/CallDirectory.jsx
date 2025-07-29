import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import VoiceCall from './VoiceCall';
import UserActionPopover from './UserActionPopover';
import './callDirectory.css';

export default function CallDirectory({ currentUser }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [showPopoverFor, setShowPopoverFor] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url');

      if (!error) {
        const filtered = data.filter((u) => u.id !== currentUser.id);
        setUsers(filtered);
      }
    };

    fetchUsers();
  }, [currentUser.id]);

  const filteredUsers = users.filter((u) =>
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="call-directory">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {targetUser && (
        <div className="call-overlay">
          <VoiceCall
            user={currentUser}
            targetId={targetUser.id}
            targetName={targetUser.display_name}
            onEnd={() => setTargetUser(null)}
          />
        </div>
      )}

      <div className="user-list">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-row">
            <img
              src={user.avatar_url || 'https://via.placeholder.com/36'}
              alt="pfp"
              className="user-avatar"
              onClick={() => setShowPopoverFor(user)}
            />
            <span className="user-name">{user.display_name || 'Unnamed User'}</span>
            <button className="call-btn" onClick={() => setTargetUser(user)}>
              📞
            </button>
          </div>
        ))}
      </div>

      {showPopoverFor && (
        <UserActionPopover
          user={showPopoverFor}
          onCall={() => {
            setTargetUser(showPopoverFor);
            setShowPopoverFor(null);
          }}
          onClose={() => setShowPopoverFor(null)}
        />
      )}
    </div>
  );
}
