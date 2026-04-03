
const express = require('express');
const router = express.Router();
const Job = require('../../models/hiring/Job');
const Candidate = require('../../models/hiring/Candidate');
const auth = require('../../middleware/auth');

router.use(auth);

// GET all jobs
// - super_admin: all jobs
// - hr: only their own jobs
// - employee: all ACTIVE jobs (no filter by postedBy)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // ✅ FIXED: employee dekhega sab Active jobs, hr sirf apni
    if (req.user.role === 'hr') {
      query.postedBy = req.user._id || req.user.id;
    }
    // super_admin aur employee ke liye koi postedBy filter nahi

    if (status) query.status = status;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const jobsWithCount = await Promise.all(jobs.map(async j => {
      const count = await Candidate.countDocuments({ job: j._id });
      return { ...j.toObject(), candidateCount: count };
    }));

    res.json({ jobs: jobsWithCount, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hrs', async (req, res) => {
  try {
    const User = require('../../models/User');
    const hrs = await User.find({ role: 'hr' }).select('name email');
    res.json(hrs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const candidates = await Candidate.find({ job: req.params.id }).select('name email stage createdAt source');
    res.json({ ...job.toObject(), candidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const postedBy = req.body.postedBy || req.user._id || req.user.id;
    const job = new Job({ ...req.body, postedBy });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/platforms', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.platforms.push({ ...req.body, postedDate: new Date() });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id/platforms/:platId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    job.platforms = job.platforms.filter(p => p._id.toString() !== req.params.platId);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;