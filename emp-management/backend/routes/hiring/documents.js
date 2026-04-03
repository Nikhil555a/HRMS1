const express = require('express');
const router = express.Router();
const Candidate = require('../../models/hiring/Candidate');
const  auth  = require('../../middleware/auth');
const { cloudUpload, cloudinary } = require('../../config/cloudinary');

router.use(auth);

router.post('/:id/offer-letter', cloudUpload.single('offerLetter'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });
    const { salary, designation, joiningDate, stipend } = req.body;
    candidate.offer = { ...candidate.offer, salary: salary ? Number(salary) : candidate.offer?.salary, stipend: stipend ? Number(stipend) : candidate.offer?.stipend, designation, joiningDate, acceptanceStatus: candidate.offer?.acceptanceStatus || 'Pending' };
    if (req.file) {
      candidate.offer.offerLetterUrl = req.file.path;
      candidate.offer.offerLetterPublicId = req.file.filename;
      candidate.offer.offerLetterSentAt = new Date();
      candidate.offer.offerLetterSentBy = req.user._id;
      if (candidate.stage === 'Selected') {
        candidate.stage = 'Offer Sent';
        candidate.stageHistory.push({ stage: 'Offer Sent', movedBy: req.user._id, movedByName: req.user.name, note: 'Offer letter uploaded' });
      }
    }
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/offer-status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });
    candidate.offer.acceptanceStatus = status;
    if (status === 'Accepted') { candidate.offer.acceptedAt = new Date(); candidate.stage = 'Offer Accepted'; candidate.stageHistory.push({ stage: 'Offer Accepted', movedBy: req.user._id, movedByName: req.user.name, note: 'Candidate accepted' }); }
    else if (status === 'Rejected') { candidate.offer.rejectedAt = new Date(); candidate.offer.rejectionReason = rejectionReason; candidate.stage = 'Offer Rejected'; candidate.stageHistory.push({ stage: 'Offer Rejected', movedBy: req.user._id, movedByName: req.user.name, note: rejectionReason }); }
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// router.post('/:id/documents', cloudUpload.single('documents'), async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) return res.status(404).json({ message: 'Not found' });
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
//     candidate.documents.push({ type: req.body.type, name: req.body.name || req.file.originalname, url: req.file.path, publicId: req.file.filename, uploadedBy: req.user._id, uploadedAt: new Date(), status: 'Pending' });
//     candidate.onboardingStatus = 'Documents Pending';
//     await candidate.save();
//     res.json(candidate);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.post('/:id/documents', cloudUpload.single('documents'), async (req, res) => {
  try {
    // console.log("BODY 👉", req.body);
    // console.log("FILE 👉", req.file);
    // console.log("USER 👉", req.user);

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.body.type) {
      return res.status(400).json({ message: 'Document type required' });
    }

    if (!candidate.documents) {
      candidate.documents = [];
    }

    candidate.documents.push({
      type: req.body.type,
      name: req.body.name || req.file.originalname,
      url: req.file.path || req.file.url,
      publicId: req.file.filename || req.file.public_id,
      uploadedBy: req.user?._id || null,
      uploadedAt: new Date(),
      status: 'Pending'
    });

    candidate.onboardingStatus = 'Documents Pending';

    await candidate.save();
    res.json(candidate);

  } catch (err) {
    console.log("🔥 FULL ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/documents/mark', async (req, res) => {
  try {
    const { type, name, status, remarks } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });
    const existing = candidate.documents.find(d => d.type === type);
    if (existing) { existing.status = status || 'Missing'; existing.remarks = remarks; }
    else candidate.documents.push({ type, name, status: status || 'Missing', remarks, uploadedBy: req.user._id });
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/documents/:docId/verify', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    const doc = candidate.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = status; doc.verified = status === 'Verified'; doc.verifiedBy = req.user._id; doc.verifiedAt = new Date(); doc.remarks = remarks;
    const allVerified = candidate.documents.length > 0 && candidate.documents.every(d => d.status === 'Verified');
    if (allVerified) candidate.onboardingStatus = 'Completed';
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id/documents/:docId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    const doc = candidate.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.publicId) { try { await cloudinary.uploader.destroy(doc.publicId); } catch (e) {} }
    candidate.documents.pull({ _id: req.params.docId });
    await candidate.save();
    res.json({ message: 'Document deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/payslips', cloudUpload.single('payslip'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Not found' });
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const { month, year, amount } = req.body;
    candidate.payslips.push({ month, year: Number(year), amount: Number(amount), url: req.file.path, publicId: req.file.filename, uploadedAt: new Date() });
    await candidate.save();
    res.json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
