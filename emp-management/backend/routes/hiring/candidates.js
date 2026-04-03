
const express = require('express');
const router = express.Router();
const Candidate = require('../../models/hiring/Candidate');
const Job = require('../../models/hiring/Job');
const auth = require("../../middleware/auth")
const { cloudUpload } = require('../../config/cloudinary');
const { notifyInterviewScheduled, emitNotificationToUser, emitUnreadCount } = require('../../socket/socketManager');
const Notification = require('../../models/Notification');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { job, stage, platform, search, page = 1, limit = 15 } = req.query;
    const query = {};
    if (req.user.role !== 'super_admin') query.assignedTo = req.user._id;
    if (job) query.job = job;
    if (stage) query.stage = stage;
    if (platform) query['source.platform'] = platform;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { currentCompany: { $regex: search, $options: 'i' } }
    ];
    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .populate('job', 'title department')
      .populate('assignedTo', 'name email')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ updatedAt: -1 })
      .select('-stageHistory -interviews -documents -payslips');
    res.json({ candidates, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('job', 'title department location jobType')
      .populate('assignedTo', 'name email')
      .populate('addedBy', 'name')
      .populate('interviews.interviewer', 'name')
      .populate('documents.uploadedBy', 'name')
      .populate('documents.verifiedBy', 'name')
      .populate('offer.offerLetterSentBy', 'name')
      .populate('stageHistory.movedBy', 'name');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', cloudUpload.single('resume'), async (req, res) => {
  try {
    const data = { ...req.body, addedBy: req.user._id, assignedTo: req.body.assignedTo || req.user._id };
    if (req.file) data.resume = { url: req.file.path, publicId: req.file.filename, uploadedAt: new Date(), name: req.file.originalname };
    if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (data.source && typeof data.source === 'string') data.source = JSON.parse(data.source);
    const candidate = new Candidate(data);
    candidate.stageHistory.push({ stage: 'Applied', movedBy: req.user._id, movedByName: req.user.name, note: 'Candidate added' });
    await candidate.save();
    if (data.job) await Job.findByIdAndUpdate(data.job, { $inc: { totalApplications: 1 } });
    await candidate.populate('job', 'title department');
    res.status(201).json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', cloudUpload.single('resume'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resume = { url: req.file.path, publicId: req.file.filename, uploadedAt: new Date(), name: req.file.originalname };
    if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (data.source && typeof data.source === 'string') data.source = JSON.parse(data.source);
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, data, { new: true }).populate('job', 'title');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage, note } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });
    candidate.stage = stage;
    candidate.stageHistory.push({ stage, movedBy: req.user._id, movedByName: req.user.name, note, date: new Date() });
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ✅ INTERVIEW SCHEDULE — HR ko turant notification
router.post('/:id/interviews', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!candidate) return res.status(404).json({ message: 'Not found' });

    // Interview add karo
    candidate.interviews.push({
      ...req.body,
      interviewer: req.user._id,
      interviewerName: req.user.name
    });
    await candidate.save();

    // ✅ Assigned HR ko notification bhejo
    const assignedHR = candidate.assignedTo;
    if (assignedHR) {
      const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
      const timeStr = scheduledAt
        ? scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '';

      // DB mein notification save karo
      const notif = await Notification.create({
        userId: assignedHR._id,
        type: 'interview_scheduled',
        title: '📅 Interview Scheduled',
        message: `${candidate.name} — ${req.body.round || 'Interview'} (${req.body.mode || ''})${timeStr ? ' at ' + timeStr : ''}`,
        link: `/hiring/candidates/${candidate._id}`,
        meta: {
          candidateId: candidate._id,
          candidateName: candidate.name,
          scheduledAt,
        },
      });

      // Socket se real-time push karo
      emitNotificationToUser(assignedHR._id.toString(), notif);
      await emitUnreadCount(assignedHR._id.toString());

      console.log(`🔔 Interview notification → HR: ${assignedHR.name} | Candidate: ${candidate.name}`);
    }

    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/interviews/:intId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    const idx = candidate.interviews.findIndex(i => i._id.toString() === req.params.intId);
    if (idx === -1) return res.status(404).json({ message: 'Interview not found' });
    candidate.interviews[idx] = { ...candidate.interviews[idx].toObject(), ...req.body };
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/assign', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.hrId },
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;




