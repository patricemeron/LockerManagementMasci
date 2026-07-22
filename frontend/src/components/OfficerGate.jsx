import { useState } from 'react';
import { clearOfficerToken, getOfficerToken } from '../api';
import OfficerLogin from './OfficerLogin';
import OfficerDashboard from './OfficerDashboard';

export default function OfficerGate() {
  const [authed, setAuthed] = useState(() => Boolean(getOfficerToken()));

  function handleLogout() {
    clearOfficerToken();
    setAuthed(false);
  }

  if (!authed) {
    return <OfficerLogin onSuccess={() => setAuthed(true)} />;
  }

  return <OfficerDashboard onSessionExpired={handleLogout} onLogout={handleLogout} />;
}
