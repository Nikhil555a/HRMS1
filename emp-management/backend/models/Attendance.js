
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },

  date: { 
    type: Date, 
    required: true 
  },

  checkIn: { type: Date },
  checkOut: { type: Date },

  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Late', 'On Leave', 'Holiday', 'Work From Home'],
    default: 'Present'
  },

  workHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },

  // ✅ FIXED PART
  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Annual', 'Maternity', 'Paternity', 'Unpaid', 'Other'],
    default: null, // 👈 important
    set: v => (v === "" ? null : v) // 👈 empty string ko null bana dega
  },

  leaveReason: {
    type: String,
    default: ""
  },

  notes: {
    type: String,
    default: ""
  },

  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  }

}, { timestamps: true });

// ✅ unique index (already good)
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

