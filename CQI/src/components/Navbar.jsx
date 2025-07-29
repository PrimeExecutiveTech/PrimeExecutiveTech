import { Link } from 'react-router-dom';

export default function Navbar({ displayName, pfpUrl }) {
  return (
    <aside className="sidebar">
      <img src={pfpUrl} alt="PFP" className="pfp" />
      <p className="display-name">{displayName}</p>
      <Link to="/chat" className="btn">Chat</Link>
      <Link to="/settings" className="btn">Settings</Link>
      <button className="btn logout" onClick={async () => {
        await supabase.auth.signOut();
        window.location.reload();
      }}>Logout</button>
    </aside>
  );
}
