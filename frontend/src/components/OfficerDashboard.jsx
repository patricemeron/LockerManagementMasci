import { useEffect, useMemo, useState } from 'react';
import { getConfig, getRegistrations, deleteRegistration } from '../api';

export default function OfficerDashboard({ onSessionExpired, onLogout }) {
  const [config, setConfig] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedLocker, setSelectedLocker] = useState(null);

  function refresh() {
    Promise.all([getConfig(), getRegistrations()])
      .then(([cfg, regs]) => {
        setConfig(cfg);
        setRegistrations(regs);
      })
      .catch((err) => {
        if (err.status === 401) return onSessionExpired();
        setError(err.message);
      });
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) =>
      [r.name, r.lrn, r.section, String(r.grade), String(r.lockerNumber), String(r.doorNumber)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [registrations, search]);

  const occupiedByLockerDoor = useMemo(() => {
    const map = new Map();
    registrations.forEach((r) => map.set(`${r.lockerNumber}-${r.doorNumber}`, r));
    return map;
  }, [registrations]);

  async function handleDelete(id) {
    if (!confirm('Remove this registration? This frees up the locker/door.')) return;
    try {
      await deleteRegistration(id);
      refresh();
    } catch (err) {
      if (err.status === 401) return onSessionExpired();
      setError(err.message);
    }
  }

  if (!config) return <p className="hint">Loading dashboard…</p>;

  const doorOptions = Array.from({ length: config.doorsPerLocker }, (_, i) => i + 1);
  const lockerOptions = Array.from({ length: config.lockerCount }, (_, i) => i + 1);

  return (
    <div className="card wide">
      <div className="dashboard-header">
        <div>
          <h1>Officer Dashboard</h1>
          <p className="hint">
            {registrations.length} of {config.lockerCount * config.doorsPerLocker} doors claimed.
          </p>
        </div>
        <button type="button" className="link-danger" onClick={onLogout}>
          Log Out
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <section>
        <h2>Locker Grid</h2>
        <p className="hint">Click a locker to see its doors. Filled squares are taken.</p>
        <div className="locker-grid">
          {lockerOptions.map((lockerNumber) => {
            const takenCount = doorOptions.filter((d) =>
              occupiedByLockerDoor.has(`${lockerNumber}-${d}`)
            ).length;
            const full = takenCount === config.doorsPerLocker;
            return (
              <button
                type="button"
                key={lockerNumber}
                className={`locker-cell ${full ? 'full' : takenCount > 0 ? 'partial' : 'empty'} ${
                  selectedLocker === lockerNumber ? 'selected' : ''
                }`}
                onClick={() => setSelectedLocker(lockerNumber)}
                title={`Locker ${lockerNumber}: ${takenCount}/${config.doorsPerLocker} taken`}
              >
                {lockerNumber}
              </button>
            );
          })}
        </div>

        {selectedLocker && (
          <div className="door-grid">
            <h3>Locker {selectedLocker} doors</h3>
            <div className="locker-grid">
              {doorOptions.map((doorNumber) => {
                const reg = occupiedByLockerDoor.get(`${selectedLocker}-${doorNumber}`);
                return (
                  <div
                    key={doorNumber}
                    className={`locker-cell ${reg ? 'full' : 'empty'}`}
                    title={reg ? `${reg.name} (${reg.lrn})` : 'Available'}
                  >
                    {doorNumber}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2>Registrations</h2>
        <input
          type="search"
          placeholder="Search by name, LRN, section, locker…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>LRN</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Locker</th>
                <th>Door</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.lrn}</td>
                  <td>{r.grade}</td>
                  <td>{r.section}</td>
                  <td>{r.lockerNumber}</td>
                  <td>{r.doorNumber}</td>
                  <td>
                    <button type="button" className="link-danger" onClick={() => handleDelete(r._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="hint">
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
