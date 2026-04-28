
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interviewerName: String,
  round: String,
  date: Date,
  mode: { type: String, enum: ['In-person', 'Video Call', 'Phone', 'Technical Test', 'HR Round'] },
  rating: { type: Number, min: 1, max: 5 },
  technicalScore: { type: Number, min: 0, max: 10 },
  communicationScore: { type: Number, min: 0, max: 10 },
  cultureFitScore: { type: Number, min: 0, max: 10 },
  feedback: String,
  strengths: String,
  weaknesses: String,
  // recommendation: { type: String, enum: ['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strong Reject'] },
  recommendation: { 
  type: String, 
  enum: ['', 'Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strong Reject'],
  default: ''
},
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
  scheduledAt: Date,
  meetingLink: String,
}, { timestamps: true });

const stageHistorySchema = new mongoose.Schema({
  stage: String,
  movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movedByName: String,
  note: String,
  date: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  type: String,
  name: String,
  url: String,
  publicId: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Missing'], default: 'Pending' },
  remarks: String,
});

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  currentLocation: String,
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobTitle: String,
  source: {
    platform: { type: String, enum: ['LinkedIn', 'Naukri', 'Indeed', 'Shine', 'Monster', 'Instahyre', 'Referral', 'Company Website', 'Walk-in', 'Campus', 'Other'] },
    platformUrl: String,
    referredBy: String,
  },
  currentCompany: String,
  currentDesignation: String,
  totalExperience: String,
  relevantExperience: String,
  currentCTC: Number,
  expectedCTC: Number,
  noticePeriod: String,
  skills: [String],
  resume: { url: String, publicId: String, uploadedAt: Date, name: String },
  stage: {
    type: String,
    enum: ['Applied','Screening','Shortlisted','Interview Scheduled','Interview In Progress','Technical Round','HR Round','Final Round','Selected','Offer Sent','Offer Accepted','Offer Rejected','Joined','Rejected','On Hold','Withdrawn'],
    default: 'Applied'
  },
  stageHistory: [stageHistorySchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interviews: [interviewSchema],
  offer: {
    salary: Number,
    stipend: Number,
    designation: String,
    joiningDate: Date,
    offerLetterUrl: String,
    offerLetterPublicId: String,
    offerLetterSentAt: Date,
    offerLetterSentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptanceStatus: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Negotiating'], default: 'Pending' },
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  documents: [documentSchema],
  onboardingStatus: { type: String, enum: ['Not Started', 'In Progress', 'Documents Pending', 'Completed'], default: 'Not Started' },
  joiningDate: Date,
  payslips: [{ month: String, year: Number, amount: Number, url: String, publicId: String, uploadedAt: Date }],
  notes: String,
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);



