const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lrn: { type: String, required: true, trim: true, unique: true, match: /^\d{1,12}$/ },
    grade: { type: Number, required: true, min: 7, max: 12 },
    section: { type: String, required: true, trim: true },
    lockerNumber: { type: Number, required: true, min: 1, max: 70 },
    doorNumber: { type: Number, required: true, min: 1, max: 18 },
  },
  { timestamps: true }
);

// A given locker/door pair can only ever be claimed once.
registrationSchema.index({ lockerNumber: 1, doorNumber: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
