const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], default: 'Full-time' },
  experienceRequired: String,
  salaryRange: { min: Number, max: Number, currency: { type: String, default: 'INR' } },
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  benefits: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Paused', 'Closed', 'Filled'], default: 'Active' },
  platforms: [{
    name: String,
    url: String,
    postedDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  openings: { type: Number, default: 1 },
  applicationDeadline: Date,
  totalApplications: { type: Number, default: 0 },
  tags: [String],
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
