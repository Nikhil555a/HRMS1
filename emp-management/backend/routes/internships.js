const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all internships
router.get('/', auth, async (req, res) => {
  try {
    const { status, department, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { internId: { $regex: search, $options: 'i' } }
      ];
    }
    const internships = await Internship.find(query)
      .populate('department', 'name code')
      .populate('mentor', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single internship
router.get('/:id', auth, async (req, res) => {
  try {
    const intern = await Internship.findById(req.params.id)
      .populate('department', 'name code')
      .populate('mentor', 'firstName lastName designation');
    if (!intern) return res.status(404).json({ message: 'Internship not found' });
    res.json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create internship
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resume = req.file.path;
    if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim());
    const intern = new Internship(data);
    await intern.save();
    res.status(201).json(intern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update internship
router.put('/:id', auth, upload.single('resume'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resume = req.file.path;
    if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim());
    const intern = await Internship.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!intern) return res.status(404).json({ message: 'Internship not found' });
    res.json(intern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update internship status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const intern = await Internship.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!intern) return res.status(404).json({ message: 'Internship not found' });
    res.json(intern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
