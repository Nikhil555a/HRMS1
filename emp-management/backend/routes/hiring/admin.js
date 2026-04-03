

const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Job = require('../../models/hiring/Job');
const Candidate = require('../../models/hiring/Candidate');

const auth = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminOnly');

router.use(auth, adminOnly);


// =========================
// 🔹 ADMIN DASHBOARD STATS
// =========================
router.get('/stats', async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      totalHRs,
      hired,
      offerSent,
      offerAccepted,
      rejected
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Candidate.countDocuments(),
      User.countDocuments({ role: 'hr' }),
      Candidate.countDocuments({ stage: { $in: ['Selected', 'Offer Accepted', 'Joined'] } }),
      Candidate.countDocuments({ stage: 'Offer Sent' }),
      Candidate.countDocuments({ 'offer.acceptanceStatus': 'Accepted' }),
      Candidate.countDocuments({ stage: 'Rejected' }),
    ]);

    // 📊 Stage Distribution
    const stageDistribution = await Candidate.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    // 📊 Platform Distribution
    const platformDistribution = await Candidate.aggregate([
      { $group: { _id: '$source.platform', count: { $sum: 1 } } }
    ]);

    // 📊 HR Performance
    const hrPerformance = await Candidate.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          hired: {
            $sum: {
              $cond: [
                { $in: ['$stage', ['Selected', 'Joined', 'Offer Accepted']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'hr'
        }
      },
      {
        $project: {
          hr: { $arrayElemAt: ['$hr.name', 0] },
          total: 1,
          hired: 1
        }
      }
    ]);

    // 📈 Monthly Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Candidate.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalJobs,
      activeJobs,
      totalCandidates,
      totalHRs,
      hired,
      offerSent,
      offerAccepted,
      rejected,
      stageDistribution,
      platformDistribution,
      hrPerformance,
      monthlyTrend
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 HR LIST WITH STATS
// =========================
router.get('/hrs', async (req, res) => {
  try {
    const hrs = await User.find({ role: 'hr' })
      .select('-password')
      .sort({ createdAt: -1 });

    const hrsWithStats = await Promise.all(
      hrs.map(async (hr) => {
        const jobsPosted = await Job.countDocuments({ postedBy: hr._id });
        const candidatesHandled = await Candidate.countDocuments({ assignedTo: hr._id });
        const hired = await Candidate.countDocuments({
          assignedTo: hr._id,
          stage: { $in: ['Selected', 'Offer Accepted', 'Joined'] }
        });

        const interviews = await Candidate.aggregate([
          { $match: { assignedTo: hr._id } },
          { $unwind: '$interviews' },
          { $match: { 'interviews.status': 'Completed' } },
          { $count: 'total' }
        ]);

        return {
          ...hr.toObject(),
          stats: {
            jobsPosted,
            candidatesHandled,
            hired,
            interviewsConducted: interviews[0]?.total || 0
          }
        };
      })
    );

    res.json(hrsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 CREATE HR
// =========================
router.post('/hrs', async (req, res) => {
  try {
    const { name, email, password, phone, department, permissions } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hr = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      department: department || '',
      role: 'hr',
      isActive: true,
      permissions: permissions || {}
    });

    res.status(201).json({ ...hr.toObject(), password: undefined });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 UPDATE HR
// =========================
router.put('/hrs/:id', async (req, res) => {
  try {
    const { name, email, phone, department, permissions, password } = req.body;

    const update = { name, email, phone, department, permissions };
    if (password) update.password = password;

    const hr = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');

    if (!hr) return res.status(404).json({ message: 'HR not found' });

    res.json(hr);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 TOGGLE HR STATUS
// =========================
router.patch('/hrs/:id/toggle', async (req, res) => {
  try {
    const hr = await User.findById(req.params.id);
    if (!hr) return res.status(404).json({ message: 'HR not found' });

    hr.isActive = !hr.isActive;
    await hr.save();

    res.json({ isActive: hr.isActive });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 RESET PASSWORD
// =========================
router.put('/hrs/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const hr = await User.findById(req.params.id);
    if (!hr) return res.status(404).json({ message: 'HR not found' });

    hr.password = newPassword;
    await hr.save();

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 DELETE HR
// =========================
router.delete('/hrs/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'HR deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 ALL JOBS
// =========================
router.get('/all-jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =========================
// 🔹 ALL CANDIDATES
// =========================
router.get('/all-candidates', async (req, res) => {
  try {
    const { page = 1, limit = 20, stage, search } = req.query;

    const query = {};
    if (stage) query.stage = stage;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Candidate.countDocuments(query);

    const candidates = await Candidate.find(query)
      .populate('job', 'title')
      .populate('assignedTo', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      candidates,
      total,
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
