
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Employee = require('../models/Employee');
const auth    = require('../middleware/auth');

// ── POST /api/auth/register (admin setup only) ─────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────
// Works for super_admin, hr AND employee — same endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. First check in User collection (admin / hr)
    let user = await User.findOne({ email });

    if (user) {
      // Check active status for HRs
      if (user.role === 'hr' && user.isActive === false) {
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact admin.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, type: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          _id:         user._id,
          id:          user._id,
          name:        user.name,
          email:       user.email,
          role:        user.role,
          phone:       user.phone,
          department:  user.department,
          isActive:    user.isActive,
          permissions: user.permissions,
          lastLogin:   user.lastLogin,
          createdAt:   user.createdAt,
        },
      });
    }

    // 2. If not found in User, check Employee collection
    const employee = await Employee.findOne({ email }).populate('department', 'name code');
    if (!employee) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check employee status
    if (employee.status === 'Terminated' || employee.status === 'Resigned') {
      return res.status(403).json({ message: `Your account is ${employee.status}. Please contact HR.` });
    }
    if (employee.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact HR.' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: employee._id, type: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        _id:            employee._id,
        id:             employee._id,
        name:           `${employee.firstName} ${employee.lastName}`,
        email:          employee.email,
        role:           'employee',
        employeeId:     employee.employeeId,
        designation:    employee.designation,
        department:     employee.department,
        profilePhoto:   employee.profilePhoto,
        status:         employee.status,
        joiningDate:    employee.joiningDate,
        phone:          employee.phone,
        createdAt:      employee.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    // req.user has { id, type } from JWT
    if (req.user.type === 'employee') {
      const employee = await Employee.findById(req.user.id)
        .select('-password')
        .populate('department', 'name code');
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      return res.json({
        ...employee.toObject(),
        role: 'employee',
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/profile ───────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.type === 'employee') {
      const { phone } = req.body;
      const employee = await Employee.findByIdAndUpdate(
        req.user.id,
        { $set: { phone } },
        { new: true, select: '-password' }
      );
      return res.json(employee);
    }

    const { phone, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { phone, department } },
      { new: true, select: '-password' }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;