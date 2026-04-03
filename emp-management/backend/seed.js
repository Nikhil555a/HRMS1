const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Job = require('./models/hiring/Job');
const Candidate = require('./models/hiring/Candidate');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Admin
  let admin = await User.findOne({ email: 'admin@company.com' });
  if (!admin) {
    admin = await User.create({ name: 'Super Admin', email: 'admin@company.com', password: 'admin123', role: 'super_admin', phone: '9876543210', department: 'Management', permissions: { canPostJobs: true, canViewAllCandidates: true, canManageDocuments: true, canSendOffers: true } });
    console.log('Admin: admin@company.com / admin123');
  }

  // HR Users
  const hrData = [
    { name: 'Priya Sharma', email: 'priya@company.com', password: 'hr123', phone: '9876543211', department: 'Technology', permissions: { canPostJobs: true, canViewAllCandidates: false, canManageDocuments: true, canSendOffers: false } },
    { name: 'Rahul Mehta', email: 'rahul@company.com', password: 'hr123', phone: '9876543212', department: 'Marketing', permissions: { canPostJobs: true, canViewAllCandidates: false, canManageDocuments: true, canSendOffers: true } },
    { name: 'Anjali Singh', email: 'anjali@company.com', password: 'hr123', phone: '9876543213', department: 'Operations', permissions: { canPostJobs: true, canViewAllCandidates: false, canManageDocuments: true, canSendOffers: false } },
  ];
  const hrs = [];
  for (const info of hrData) {
    let hr = await User.findOne({ email: info.email });
    if (!hr) { hr = await User.create({ ...info, role: 'hr' }); console.log('HR: ' + info.email + ' / ' + info.password); }
    hrs.push(hr);
  }

  // Departments
  const deptData = [
    { name: 'Engineering', code: 'ENG', description: 'Software development', location: 'Floor 3' },
    { name: 'Human Resources', code: 'HR', description: 'Talent acquisition', location: 'Floor 1' },
    { name: 'Marketing', code: 'MKT', description: 'Brand and digital', location: 'Floor 2' },
    { name: 'Finance', code: 'FIN', description: 'Accounting', location: 'Floor 1' },
    { name: 'Operations', code: 'OPS', description: 'Business operations', location: 'Floor 2' },
  ];
  const depts = [];
  for (const d of deptData) {
    let dept = await Department.findOne({ code: d.code });
    if (!dept) { dept = await Department.create(d); console.log('Department: ' + d.name); }
    depts.push(dept);
  }

  // Employees
  const empCount = await Employee.countDocuments();
  if (empCount === 0) {
    const samples = [
      { employeeId: 'EMP001', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.emp@company.com', phone: '9876500001', department: depts[0]._id, designation: 'Senior Software Engineer', joiningDate: new Date('2022-03-15'), status: 'Active', skills: ['React', 'Node.js'] },
      { employeeId: 'EMP002', firstName: 'Priti', lastName: 'Patel', email: 'priti.emp@company.com', phone: '9876500002', department: depts[1]._id, designation: 'HR Manager', joiningDate: new Date('2021-06-01'), status: 'Active', skills: ['Recruitment'] },
      { employeeId: 'EMP003', firstName: 'Rahul', lastName: 'Gupta', email: 'rahul.emp@company.com', phone: '9876500003', department: depts[2]._id, designation: 'Marketing Lead', joiningDate: new Date('2023-01-10'), status: 'Active', skills: ['SEO'] },
      { employeeId: 'EMP004', firstName: 'Sneha', lastName: 'Verma', email: 'sneha.emp@company.com', phone: '9876500004', department: depts[0]._id, designation: 'Frontend Developer', joiningDate: new Date('2023-07-01'), status: 'On Leave', skills: ['React'] },
      { employeeId: 'EMP005', firstName: 'Amit', lastName: 'Kumar', email: 'amit.emp@company.com', phone: '9876500005', department: depts[3]._id, designation: 'Financial Analyst', joiningDate: new Date('2020-11-20'), status: 'Active', skills: ['Excel'] },
    ];
    for (const emp of samples) { await Employee.create(emp); console.log('Employee: ' + emp.firstName + ' ' + emp.lastName); }
  }

  // Jobs
  const jobs = [];
  const jobData = [
    { title: 'Senior React Developer', department: 'Technology', location: 'Bangalore', jobType: 'Full-time', experienceRequired: '3-6 years', description: 'Looking for React developer.', skills: ['React', 'JavaScript'], platforms: [{ name: 'LinkedIn', url: 'https://linkedin.com', postedDate: new Date(), isActive: true }, { name: 'Naukri', url: 'https://naukri.com', postedDate: new Date(), isActive: true }], openings: 3, priority: 'High', salaryRange: { min: 1200000, max: 2000000 }, postedBy: hrs[0]._id, status: 'Active' },
    { title: 'Digital Marketing Manager', department: 'Marketing', location: 'Mumbai', jobType: 'Full-time', experienceRequired: '2-5 years', description: 'Digital marketing expert needed.', skills: ['SEO', 'Google Ads'], platforms: [{ name: 'Indeed', url: 'https://indeed.com', postedDate: new Date(), isActive: true }], openings: 1, priority: 'Medium', salaryRange: { min: 800000, max: 1500000 }, postedBy: hrs[1]._id, status: 'Active' },
    { title: 'Operations Intern', department: 'Operations', location: 'Delhi', jobType: 'Internship', experienceRequired: 'Fresher', description: 'Intern for operations team.', skills: ['Excel'], platforms: [{ name: 'Internshala', url: 'https://internshala.com', postedDate: new Date(), isActive: true }], openings: 5, priority: 'Low', salaryRange: { min: 15000, max: 25000 }, postedBy: hrs[2]._id, status: 'Active' },
  ];
  for (const j of jobData) {
    let job = await Job.findOne({ title: j.title });
    if (!job) { job = await Job.create(j); console.log('Job: ' + j.title); }
    jobs.push(job);
  }

  // Candidates
  const candCount = await Candidate.countDocuments();
  if (candCount === 0) {
    const candData = [
      { name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '9876600001', currentCompany: 'TCS', totalExperience: '4 years', currentCTC: 800000, expectedCTC: 1500000, noticePeriod: '30 days', skills: ['React'], source: { platform: 'LinkedIn' }, stage: 'Interview In Progress', job: jobs[0]._id, jobTitle: jobs[0].title, assignedTo: hrs[0]._id, addedBy: hrs[0]._id },
      { name: 'Pooja Nair', email: 'pooja@gmail.com', phone: '9876600002', currentCompany: 'Infosys', totalExperience: '3 years', currentCTC: 600000, expectedCTC: 1200000, skills: ['React'], source: { platform: 'Naukri' }, stage: 'Shortlisted', job: jobs[0]._id, jobTitle: jobs[0].title, assignedTo: hrs[0]._id, addedBy: hrs[0]._id },
      { name: 'Rohan Kapoor', email: 'rohan@gmail.com', phone: '9876600003', currentCompany: 'Freelance', totalExperience: '3 years', skills: ['SEO'], source: { platform: 'Indeed' }, stage: 'Offer Sent', job: jobs[1]._id, jobTitle: jobs[1].title, assignedTo: hrs[1]._id, addedBy: hrs[1]._id, offer: { salary: 950000, designation: 'Marketing Manager', acceptanceStatus: 'Pending' } },
      { name: 'Kavita Reddy', email: 'kavita@gmail.com', phone: '9876600004', totalExperience: 'Fresher', skills: ['Excel'], source: { platform: 'Internshala' }, stage: 'Selected', job: jobs[2]._id, jobTitle: jobs[2].title, assignedTo: hrs[2]._id, addedBy: hrs[2]._id },
      { name: 'Suresh Verma', email: 'suresh@gmail.com', phone: '9876600005', currentCompany: 'Wipro', totalExperience: '5 years', currentCTC: 1000000, expectedCTC: 1800000, skills: ['React'], source: { platform: 'LinkedIn' }, stage: 'Offer Accepted', job: jobs[0]._id, jobTitle: jobs[0].title, assignedTo: hrs[0]._id, addedBy: hrs[0]._id, offer: { salary: 1800000, designation: 'Senior React Developer', acceptanceStatus: 'Accepted', acceptedAt: new Date() }, onboardingStatus: 'Documents Pending' },
    ];
    for (const c of candData) {
      const cand = new Candidate(c);
      cand.stageHistory.push({ stage: 'Applied', movedByName: 'System', note: 'Added', date: new Date() });
      await cand.save();
      console.log('Candidate: ' + c.name);
    }
  }

  console.log('\nSeed complete!');
  console.log('Login: admin@company.com / admin123');
  console.log('HR: priya@company.com / hr123');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
