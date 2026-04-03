const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName employeeId');
    const deptWithCount = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id, status: 'Active' });
      return { ...dept.toObject(), employeeCount: count };
    }));
    res.json(deptWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id).populate('manager', 'firstName lastName');
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const employees = await Employee.find({ department: req.params.id });
    res.json({ ...dept.toObject(), employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create department
router.post('/', auth, async (req, res) => {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update department
router.put('/:id', auth, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete department
router.delete('/:id', auth, async (req, res) => {
  try {
    const empCount = await Employee.countDocuments({ department: req.params.id });
    if (empCount > 0) return res.status(400).json({ message: 'Cannot delete department with active employees' });
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
