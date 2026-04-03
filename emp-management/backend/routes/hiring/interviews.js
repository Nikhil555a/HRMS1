const express = require('express');
const router = express.Router();
const Candidate = require('../../models/hiring/Candidate');
const auth  = require('../../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const baseQ = req.user.role === 'super_admin' ? {} : { assignedTo: req.user._id };
    const candidates = await Candidate.find(baseQ).populate('job', 'title').select('name email phone stage interviews job');
    const interviews = [];
    candidates.forEach(c => {
      c.interviews.forEach(i => {
        if (status && i.status !== status) return;
        interviews.push({ candidate: { _id: c._id, name: c.name, email: c.email, phone: c.phone }, job: c.job, interview: i });
      });
    });
    interviews.sort((a, b) => new Date(b.interview.scheduledAt || 0) - new Date(a.interview.scheduledAt || 0));
    res.json(interviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
