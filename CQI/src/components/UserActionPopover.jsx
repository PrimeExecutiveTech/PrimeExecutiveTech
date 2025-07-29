import './userActionPopover.css';

export default function UserActionPopover({ user, onCall, onClose }) {
  if (!user) return null;

  return (
    <div className="user-popover" onClick={onClose}>
      <div className="popover-card" onClick={(e) => e.stopPropagation()}>
        <img
          src={user.avatar_url || 'https://via.placeholder.com/64'}
          alt="pfp"
          className="popover-avatar"
        />
        <h3>{user.display_name || 'Unnamed User'}</h3>
        <button className="popover-btn" onClick={onCall}>📞 Voice Call</button>
        <button className="popover-close" onClick={onClose}>❌ Close</button>
      </div>
    </div>
  );
}
