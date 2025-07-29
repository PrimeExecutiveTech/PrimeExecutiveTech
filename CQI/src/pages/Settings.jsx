import React from 'react';
import SettingsPanel from '../components/SettingsPanel';

export default function Settings({ displayName, setDisplayName, pfpUrl, setPfpUrl }) {
  return (
    <SettingsPanel
      displayName={displayName}
      setDisplayName={setDisplayName}
      pfpUrl={pfpUrl}
      setPfpUrl={setPfpUrl}
    />
  );
}
