const express = require('express');
const router = express.Router();
const Candidate = require('../../models/hiring/Candidate');
const Job = require('../../models/hiring/Job');
const  auth  = require('../../middleware/auth');

router.use(auth);

router.get('/hr', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'super_admin';
    const baseQ = isAdmin ? {} : { assignedTo: req.user._id };
    const jobQ = isAdmin ? {} : { postedBy: req.user._id };
    const [totalJobs, activeJobs, totalCandidates, inProgress, selected, rejected, offerPending, docsPending, stages, platforms, recent] = await Promise.all([
      Job.countDocuments(jobQ),
      Job.countDocuments({ ...jobQ, status: 'Active' }),
      Candidate.countDocuments(baseQ),
      Candidate.countDocuments({ ...baseQ, stage: { $in: ['Screening','Shortlisted','Interview Scheduled','Interview In Progress','Technical Round','HR Round','Final Round'] } }),
      Candidate.countDocuments({ ...baseQ, stage: { $in: ['Selected','Offer Sent','Offer Accepted','Joined'] } }),
      Candidate.countDocuments({ ...baseQ, stage: 'Rejected' }),
      Candidate.countDocuments({ ...baseQ, stage: 'Offer Sent', 'offer.acceptanceStatus': 'Pending' }),
      Candidate.countDocuments({ ...baseQ, onboardingStatus: 'Documents Pending' }),
      Candidate.aggregate([{ $match: isAdmin ? {} : { assignedTo: req.user._id } }, { $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Candidate.aggregate([{ $match: isAdmin ? {} : { assignedTo: req.user._id } }, { $group: { _id: '$source.platform', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Candidate.find(baseQ).populate('job', 'title').sort({ updatedAt: -1 }).limit(5).select('name email stage job source updatedAt'),
    ]);
    const topJobs = await Candidate.aggregate([
      ...(isAdmin ? [] : [{ $match: { assignedTo: req.user._id } }]),
      { $group: { _id: '$job', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 },
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $project: { title: { $arrayElemAt: ['$job.title', 0] }, count: 1 } }
    ]);
    res.json({ stats: { totalJobs, activeJobs, totalCandidates, inProgress, selected, rejected, offerPending, docsPending }, stages, platforms, recent, topJobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/interviews', async (req, res) => {
  try {
    const baseQ = req.user.role === 'super_admin' ? {} : { assignedTo: req.user._id };
    const candidates = await Candidate.find({ ...baseQ, 'interviews.status': 'Scheduled', 'interviews.scheduledAt': { $gte: new Date() } }).populate('job', 'title').select('name email stage interviews job');
    const upcoming = [];
    candidates.forEach(c => {
      c.interviews.filter(i => i.status === 'Scheduled' && i.scheduledAt >= new Date()).forEach(i => {
        upcoming.push({ candidate: { _id: c._id, name: c.name, email: c.email }, job: c.job, interview: i });
      });
    });
    upcoming.sort((a, b) => new Date(a.interview.scheduledAt) - new Date(b.interview.scheduledAt));
    res.json(upcoming.slice(0, 20));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
