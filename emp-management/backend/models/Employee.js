
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const educationSchema = new mongoose.Schema({
//   degree: String,
//   institution: String,
//   fieldOfStudy: String,
//   startYear: Number,
//   endYear: Number,
//   grade: String
// });

// const experienceSchema = new mongoose.Schema({
//   jobTitle: String,
//   company: String,
//   location: String,
//   startDate: Date,
//   endDate: Date,
//   currentlyWorking: { type: Boolean, default: false },
//   description: String
// });

// const employeeSchema = new mongoose.Schema({
//   employeeId: { type: String, required: true, unique: true },
//   firstName: { type: String, required: true, trim: true },
//   lastName: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true, minlength: 6 }, // ← NEW: employee login password
//   phone: { type: String, required: true },
//   alternatePhone: String,
//   dateOfBirth: Date,
//   gender: { type: String, enum: ['Male', 'Female', 'Other'] },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     country: String,
//     zipCode: String
//   },
//   profilePhoto: String,
//   resume: String,
//   department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
//   designation: { type: String, required: true },
//   appliedPosition: String,
//   employmentType: {
//     type: String,
//     enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
//     default: 'Full-time'
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'],
//     default: 'Active'
//   },
//   joiningDate: { type: Date, required: true },
//   closingDate: Date,
//   salary: Number,
//   skills: [String],
//   education: [educationSchema],
//   experience: [experienceSchema],
//   previousCompany: String,
//   bloodGroup: String,
//   emergencyContact: {
//     name: String,
//     relationship: String,
//     phone: String
//   }
// }, { timestamps: true });

// // Hash password before saving
// employeeSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Also hash on findOneAndUpdate if password is in update
// employeeSchema.pre('findOneAndUpdate', async function (next) {
//   const update = this.getUpdate();
//   if (update.password) {
//     update.password = await bcrypt.hash(update.password, 10);
//   }
//   next();
// });

// // Compare password method
// employeeSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('Employee', employeeSchema);


// bina hass ke 
const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree:       String,
  institution:  String,
  fieldOfStudy: String,
  startYear:    Number,
  endYear:      Number,
  grade:        String,
});

const experienceSchema = new mongoose.Schema({
  jobTitle:         String,
  company:          String,
  location:         String,
  startDate:        Date,
  endDate:          Date,
  currentlyWorking: { type: Boolean, default: false },
  description:      String,
});

const employeeSchema = new mongoose.Schema({
  employeeId:    { type: String, required: true, unique: true },
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 6 },
  phone:         { type: String, required: true },
  alternatePhone: String,
  dateOfBirth:   Date,
  gender:        { type: String, enum: ['Male', 'Female', 'Other'] },
  address: {
    street:  String,
    city:    String,
    state:   String,
    country: String,
    zipCode: String,
  },
  profilePhoto:    String,
  resume:          String,
  department:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  designation:     { type: String, required: true },
  appliedPosition: String,
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'],
    default: 'Active',
  },
  joiningDate:  { type: Date, required: true },
  closingDate:  Date,
  salary:       Number,
  skills:       [String],
  education:    [educationSchema],
  experience:   [experienceSchema],
  previousCompany: String,
  bloodGroup:   String,
  emergencyContact: {
    name:         String,
    relationship: String,
    phone:        String,
  },
}, { timestamps: true });

// bcrypt hooks HATAYE — password plain text rahega

// Plain text compare
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

// toJSON mein password include karo — edit form ke liye
employeeSchema.methods.toJSON = function () {
  return this.toObject();
};

module.exports = mongoose.model('Employee', employeeSchema);