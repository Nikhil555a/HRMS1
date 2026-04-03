const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  location: { type: String },
  budget: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
