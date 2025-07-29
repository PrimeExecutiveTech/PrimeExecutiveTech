export default function GroupSelector({ groups, selected, onSelect }) {
  return (
    <div className="group-selector">
      <div onClick={() => onSelect('00000000-0000-0000-0000-000000000000')} className={selected === '00000000-0000-0000-0000-000000000000' ? 'active' : ''}>
        🌐 Global Chat
      </div>
      {groups.map(group => (
        <div key={group.id} onClick={() => onSelect(group.id)} className={selected === group.id ? 'active' : ''}>
          {group.avatar && <img src={group.avatar} alt="group" className="group-avatar" />}
          {group.name}
        </div>
      ))}
    </div>
  );
}
