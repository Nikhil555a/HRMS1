
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all employees with filters
router.get('/', auth, async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      // .select('-password') // Never send password
      .populate('department', 'name code')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ employees, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      // .select('-password')
      .populate('department', 'name code');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get own profile (for employee role)
router.get('/me/profile', auth, async (req, res) => {
  try {
    if (req.user.type !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const employee = await Employee.findById(req.user.id)
      .select('-password')
      .populate('department', 'name code');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create employee — now includes password
// router.post('/', auth, upload.fields([
//   { name: 'profilePhoto', maxCount: 1 },
//   { name: 'resume', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const data = { ...req.body };
//     if (req.files?.profilePhoto) data.profilePhoto = req.files.profilePhoto[0].path;
//     if (req.files?.resume) data.resume = req.files.resume[0].path;
//     if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim());
//     if (data.education && typeof data.education === 'string') data.education = JSON.parse(data.education);
//     if (data.experience && typeof data.experience === 'string') data.experience = JSON.parse(data.experience);
//     if (data.address && typeof data.address === 'string') data.address = JSON.parse(data.address);
//     if (data.emergencyContact && typeof data.emergencyContact === 'string') data.emergencyContact = JSON.parse(data.emergencyContact);

//     // password is required in Employee model — must be provided at creation
//     if (!data.password) return res.status(400).json({ message: 'Password is required for employee login' });

//     const employee = new Employee(data);
//     await employee.save();
//     await employee.populate('department', 'name code');

//     // Return without password
//     const empObj = employee.toObject();
//     delete empObj.password;
//     res.status(201).json(empObj);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });


router.post('/', auth, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files?.profilePhoto) data.profilePhoto = req.files.profilePhoto[0].path;
    if (req.files?.resume) data.resume = req.files.resume[0].path;

    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map(s => s.trim());
    }

    if (data.education && typeof data.education === 'string') {
      data.education = JSON.parse(data.education);
    }

    if (data.experience && typeof data.experience === 'string') {
      data.experience = JSON.parse(data.experience);
    }

    if (data.address && typeof data.address === 'string') {
      data.address = JSON.parse(data.address);
    }

    if (data.emergencyContact && typeof data.emergencyContact === 'string') {
      data.emergencyContact = JSON.parse(data.emergencyContact);
    }

    // ✅ password check
    if (!data.password) {
      return res.status(400).json({ message: 'Password is required for employee login' });
    }

    // 🔥 AUTO GENERATE EMPLOYEE ID
    const count = await Employee.countDocuments();
    data.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = new Employee(data);
    await employee.save();
    await employee.populate('department', 'name code');

    const empObj = employee.toObject();
    delete empObj.password;

    res.status(201).json(empObj);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update employee
router.put('/:id', auth, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.profilePhoto) data.profilePhoto = req.files.profilePhoto[0].path;
    if (req.files?.resume) data.resume = req.files.resume[0].path;
    if (data.skills && typeof data.skills === 'string') data.skills = data.skills.split(',').map(s => s.trim());
    if (data.education && typeof data.education === 'string') data.education = JSON.parse(data.education);
    if (data.experience && typeof data.experience === 'string') data.experience = JSON.parse(data.experience);
    if (data.address && typeof data.address === 'string') data.address = JSON.parse(data.address);
    if (data.emergencyContact && typeof data.emergencyContact === 'string') data.emergencyContact = JSON.parse(data.emergencyContact);

    // If password not provided, remove from update to keep existing
    if (!data.password) delete data.password;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id, data,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('department', 'name code');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update employee status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, closingDate } = req.body;
    const update = { status };
    if (closingDate) update.closingDate = closingDate;
    const employee = await Employee.findByIdAndUpdate(req.params.id, update, { new: true })
    .select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'Active' });
    const inactive = await Employee.countDocuments({ status: { $in: ['Inactive', 'Terminated', 'Resigned'] } });
    const onLeave = await Employee.countDocuments({ status: 'On Leave' });
    const byDept = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { name: { $arrayElemAt: ['$dept.name', 0] }, count: 1 } }
    ]);
    res.json({ total, active, inactive, onLeave, byDept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;