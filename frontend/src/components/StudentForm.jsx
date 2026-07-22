import { useEffect, useMemo, useState } from 'react';
import { getConfig, getAvailability, createRegistration } from '../api';

const EMPTY_FORM = {
  name: '',
  lrn: '',
  grade: '',
  section: '',
  lockerNumber: '',
  doorNumber: '',
};

export default function StudentForm() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [takenDoors, setTakenDoors] = useState([]);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getConfig().then(setConfig).catch((err) => setStatus({ type: 'error', message: err.message }));
  }, []);

  useEffect(() => {
    if (!form.lockerNumber) {
      setTakenDoors([]);
      return;
    }
    let cancelled = false;
    getAvailability(form.lockerNumber)
      .then((data) => {
        if (!cancelled) setTakenDoors(data.takenDoors);
      })
      .catch((err) => {
        if (!cancelled) setStatus({ type: 'error', message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [form.lockerNumber]);

  const lockerOptions = useMemo(
    () => (config ? Array.from({ length: config.lockerCount }, (_, i) => i + 1) : []),
    [config]
  );

  const doorOptions = useMemo(
    () => (config ? Array.from({ length: config.doorsPerLocker }, (_, i) => i + 1) : []),
    [config]
  );

  function handleChange(field) {
    return (e) => {
      let value = e.target.value;
      if (field === 'lrn') value = value.replace(/\D/g, '').slice(0, 12);
      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...(field === 'lockerNumber' ? { doorNumber: '' } : {}),
      }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setSubmitting(true);
    try {
      await createRegistration(form);
      setStatus({
        type: 'success',
        message: `Locker ${form.lockerNumber}, Door ${form.doorNumber} reserved for ${form.name}.`,
      });
      setForm(EMPTY_FORM);
      setTakenDoors([]);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      // Refresh availability in case the conflict was a taken door.
      if (form.lockerNumber) {
        getAvailability(form.lockerNumber).then((data) => setTakenDoors(data.takenDoors));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!config) {
    return <p className="hint">Loading form…</p>;
  }

  return (
    <form className="card" onSubmit={handleSubmit} autoComplete="off">
      <h1>Locker Registration</h1>
      <p className="hint">Fill in your details and pick your assigned locker and door.</p>

      <div className="row">
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            required
            placeholder="Juan Dela Cruz"
            autoComplete="off"
            name="student-name-field"
          />
        </label>

        <label>
          LRN
          <input
            type="text"
            inputMode="numeric"
            value={form.lrn}
            onChange={handleChange('lrn')}
            required
            maxLength={12}
            placeholder="123456789012"
            autoComplete="off"
            name="student-lrn-field"
          />
        </label>
      </div>

      <div className="row">
        <label>
          Grade
          <select value={form.grade} onChange={handleChange('grade')} required>
            <option value="" disabled>
              Select grade
            </option>
            {config.grades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </label>

        <label>
          Section
          <input
            type="text"
            value={form.section}
            onChange={handleChange('section')}
            required
            placeholder="e.g. Diamond"
          />
        </label>
      </div>

      <div className="row">
        <label>
          Locker Number
          <select value={form.lockerNumber} onChange={handleChange('lockerNumber')} required>
            <option value="" disabled>
              Select locker
            </option>
            {lockerOptions.map((n) => (
              <option key={n} value={n}>
                Locker {n}
              </option>
            ))}
          </select>
        </label>

        <label>
          Door Number
          <select
            value={form.doorNumber}
            onChange={handleChange('doorNumber')}
            required
            disabled={!form.lockerNumber}
          >
            <option value="" disabled>
              {form.lockerNumber ? 'Select door' : 'Select a locker first'}
            </option>
            {doorOptions.map((n) => (
              <option key={n} value={n} disabled={takenDoors.includes(n)}>
                Door {n} {takenDoors.includes(n) ? '(taken)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status.type && <p className={status.type === 'error' ? 'error' : 'success'}>{status.message}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
