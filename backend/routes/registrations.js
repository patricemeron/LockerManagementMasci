const express = require('express');
const Registration = require('../models/Registration');
const { requireOfficer } = require('../middleware/auth');

const LOCKER_COUNT = 70;
const DOORS_PER_LOCKER = 18;
const GRADES = [7, 8, 9, 10, 11, 12];

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({ lockerCount: LOCKER_COUNT, doorsPerLocker: DOORS_PER_LOCKER, grades: GRADES });
});

const LRN_PATTERN = /^\d{1,12}$/;

function validatePayload(body) {
  const errors = [];
  const name = String(body.name || '').trim();
  const lrn = String(body.lrn || '').trim();
  const section = String(body.section || '').trim();
  const grade = Number(body.grade);
  const lockerNumber = Number(body.lockerNumber);
  const doorNumber = Number(body.doorNumber);

  if (!name) errors.push('Name is required.');
  if (!lrn) {
    errors.push('LRN is required.');
  } else if (!LRN_PATTERN.test(lrn)) {
    errors.push('LRN must be numeric and at most 12 digits.');
  }
  if (!section) errors.push('Section is required.');
  if (!GRADES.includes(grade)) errors.push('Grade must be between 7 and 12.');
  if (!Number.isInteger(lockerNumber) || lockerNumber < 1 || lockerNumber > LOCKER_COUNT) {
    errors.push(`Locker number must be between 1 and ${LOCKER_COUNT}.`);
  }
  if (!Number.isInteger(doorNumber) || doorNumber < 1 || doorNumber > DOORS_PER_LOCKER) {
    errors.push(`Door number must be between 1 and ${DOORS_PER_LOCKER}.`);
  }

  return { errors, value: { name, lrn, grade, section, lockerNumber, doorNumber } };
}

// Doors already taken for a given locker, so the frontend can hide/disable them.
router.get('/availability', async (req, res) => {
  const lockerNumber = Number(req.query.locker);
  if (!Number.isInteger(lockerNumber) || lockerNumber < 1 || lockerNumber > LOCKER_COUNT) {
    return res.status(400).json({ error: `Locker number must be between 1 and ${LOCKER_COUNT}.` });
  }
  const taken = await Registration.find({ lockerNumber }, 'doorNumber').lean();
  res.json({ takenDoors: taken.map((r) => r.doorNumber) });
});

router.get('/', requireOfficer, async (req, res) => {
  const registrations = await Registration.find()
    .sort({ lockerNumber: 1, doorNumber: 1 })
    .lean();
  res.json(registrations);
});

router.post('/', async (req, res) => {
  const { errors, value } = validatePayload(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  try {
    const registration = await Registration.create(value);
    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) {
      const message = Object.keys(err.keyPattern || {}).includes('lrn')
        ? 'This LRN has already registered a locker.'
        : `Locker ${value.lockerNumber}, Door ${value.doorNumber} is already taken. Please choose another door.`;
      return res.status(409).json({ error: message });
    }
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

router.delete('/:id', requireOfficer, async (req, res) => {
  const deleted = await Registration.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Registration not found.' });
  res.status(204).end();
});

module.exports = router;
