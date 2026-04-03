const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  internId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  college: String,
  degree: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  project: String,
  stipend: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Terminated', 'Extended'],
    default: 'Active'
  },
  skills: [String],
  resume: String,
  certificate: String,
  performance: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor']
  },
  offerLetter: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
