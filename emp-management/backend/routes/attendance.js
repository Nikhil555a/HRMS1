
const express    = require('express');
const router     = express.Router();
const Attendance = require('../models/Attendance');
const auth       = require('../middleware/auth');

// ─── Helper: midnight of a given date ────────────────────────────────────────
const startOfDay = (d = new Date()) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

// ─── Populate helper ──────────────────────────────────────────────────────────
const POPULATE = { path: 'employee', select: 'firstName lastName employeeId profilePhoto' };

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/attendance/my?month=4&year=2026
// Employee: fetch own monthly records
// FIX: was returning { records } object, now returns plain array
// ══════════════════════════════════════════════════════════════════════════════
router.get('/my', auth, async (req, res) => {
  try {
    const m    = req.query.month ? parseInt(req.query.month) - 1 : new Date().getMonth();
    const y    = req.query.year  ? parseInt(req.query.year)      : new Date().getFullYear();
    const from = new Date(y, m, 1);
    const to   = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      employee: req.user.id,
      date: { $gte: from, $lte: to },
    })
      .populate(POPULATE)
      .sort({ date: 1 })
      .lean();

    // FIX: return plain array (not wrapped object)
    res.json(records);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/attendance/checkin
// Body: { checkIn?: ISO string, todayTasks?: string }
// Uses req.user.id from JWT — no employee field needed from frontend
// ══════════════════════════════════════════════════════════════════════════════
router.post('/checkin', auth, async (req, res) => {
  try {
    const today     = startOfDay();
    const checkInAt = req.body.checkIn ? new Date(req.body.checkIn) : new Date();

    // Duplicate check
    const existing = await Attendance.findOne({ employee: req.user.id, date: today });
    if (existing?.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    let record;
    if (existing) {
      // Admin pre-marked record exists — just add checkIn
      existing.checkIn     = checkInAt;
      existing.status      = 'Present';
      if (req.body.todayTasks) existing.notes = `Tasks: ${req.body.todayTasks}`;
      await existing.save();
      record = existing;
    } else {
      record = await Attendance.create({
        employee:  req.user.id,
        date:      today,
        checkIn:   checkInAt,
        status:    'Present',
        notes:     req.body.todayTasks ? `Tasks: ${req.body.todayTasks}` : '',
      });
    }

    await record.populate(POPULATE);
    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/attendance/checkout
// Body: { checkOut?: ISO string, updatedTasks?: string }
// FIX: uses req.user.id (auth protected), no employee dropdown mismatch
// ══════════════════════════════════════════════════════════════════════════════
router.post('/checkout', auth, async (req, res) => {
  try {
    const today      = startOfDay();
    const checkOutAt = req.body.checkOut ? new Date(req.body.checkOut) : new Date();

    // Find today's record for the logged-in user
    const record = await Attendance.findOne({ employee: req.user.id, date: today });

    if (!record) {
      return res.status(400).json({ message: 'No attendance record found for today. Please check-in first.' });
    }
    if (!record.checkIn) {
      return res.status(400).json({ message: 'You have not checked in today. Please check-in first.' });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out today.' });
    }

    const diffHrs     = (checkOutAt - record.checkIn) / 3600000;
    record.checkOut   = checkOutAt;
    record.workHours  = parseFloat(diffHrs.toFixed(2));

    // Append updatedTasks to notes if provided
    if (req.body.updatedTasks) {
      record.notes = [record.notes, `Updates: ${req.body.updatedTasks}`].filter(Boolean).join(' | ');
    }

    // Half day if worked less than 5 hours
    if (diffHrs < 5 && record.status === 'Present') {
      record.status = 'Half Day';
    }

    await record.save();
    await record.populate(POPULATE);
    res.json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/attendance/today
// FIX: restored auth middleware, uses req.user.id (not query param)
// This removes the employee ObjectId mismatch issue entirely
// ══════════════════════════════════════════════════════════════════════════════
router.get('/today', auth, async (req, res) => {
  try {
    const record = await Attendance.findOne({
      employee: req.user.id,
      date:     startOfDay(),
    }).populate(POPULATE).lean();

    res.json(record || null);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/attendance  (Admin — all employees)
// Query: ?employee=id&month=4&year=2026&status=Present
// ══════════════════════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const { employee, month, year, status } = req.query;
    const query = {};

    if (employee) query.employee = employee;
    if (status)   query.status   = status;

    if (month && year) {
      const m    = parseInt(month) - 1;
      const y    = parseInt(year);
      query.date = { $gte: new Date(y, m, 1), $lte: new Date(y, m + 1, 0, 23, 59, 59) };
    }

    const records = await Attendance.find(query)
      .populate(POPULATE)
      .sort({ date: -1 })
      .lean();

    res.json(records);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/attendance/manual  (Admin — mark for any employee)
// Body: { employee, date, status, checkIn?, checkOut?, notes? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/manual', auth, async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, notes } = req.body;
    if (!employee || !date || !status) {
      return res.status(400).json({ message: 'employee, date, status are required' });
    }

    const day = startOfDay(date);

    const existing = await Attendance.findOne({ employee, date: day });
    if (existing) {
      return res.status(400).json({ message: 'Attendance record already exists for this date. Use edit instead.' });
    }

    const workHours = checkIn && checkOut
      ? parseFloat(((new Date(checkOut) - new Date(checkIn)) / 3600000).toFixed(2))
      : 0;

    const record = await Attendance.create({
      employee,
      date:     day,
      status,
      checkIn:  checkIn  ? new Date(checkIn)  : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      workHours,
      notes:    notes || '',
    });

    await record.populate(POPULATE);
    res.status(201).json(record);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/attendance/stats  — current month summary for logged-in employee
// ══════════════════════════════════════════════════════════════════════════════
router.get('/stats', auth, async (req, res) => {
  try {
    const now  = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: req.user.id,
      date: { $gte: from, $lte: to },
    }).lean();

    res.json({
      present:    records.filter(r => r.status === 'Present').length,
      absent:     records.filter(r => r.status === 'Absent').length,
      halfDay:    records.filter(r => r.status === 'Half Day').length,
      leave:      records.filter(r => ['Leave', 'On Leave'].includes(r.status)).length,
      totalHours: parseFloat(records.reduce((s, r) => s + (r.workHours || 0), 0).toFixed(2)),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/attendance/summary/:employeeId  (Admin summary for a specific employee)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/summary/:employeeId', auth, async (req, res) => {
  try {
    const m    = req.query.month ? parseInt(req.query.month) - 1 : new Date().getMonth();
    const y    = req.query.year  ? parseInt(req.query.year)      : new Date().getFullYear();
    const from = new Date(y, m, 1);
    const to   = new Date(y, m + 1, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: req.params.employeeId,
      date: { $gte: from, $lte: to },
    }).lean();

    res.json({
      summary: {
        present:       records.filter(r => r.status === 'Present').length,
        absent:        records.filter(r => r.status === 'Absent').length,
        halfDay:       records.filter(r => r.status === 'Half Day').length,
        onLeave:       records.filter(r => ['Leave', 'On Leave'].includes(r.status)).length,
        wfh:           records.filter(r => r.status === 'Work From Home').length,
        totalWorkHours: parseFloat(records.reduce((s, r) => s + (r.workHours || 0), 0).toFixed(2)),
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/attendance/:id  (Edit a record)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Allow updating these fields
    const allowed = ['status', 'checkIn', 'checkOut', 'workHours', 'notes', 'leaveType', 'leaveReason'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if ((field === 'checkIn' || field === 'checkOut') && req.body[field]) {
          record[field] = new Date(req.body[field]);
        } else {
          record[field] = req.body[field];
        }
      }
    });

    // Auto-calculate workHours if both times present
    if (record.checkIn && record.checkOut) {
      const diff = (record.checkOut - record.checkIn) / 3600000;
      record.workHours = parseFloat(diff.toFixed(2));
      if (diff < 5 && record.status === 'Present') record.status = 'Half Day';
    }

    await record.save();
    await record.populate(POPULATE);
    res.json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/attendance  (Legacy / direct mark — same as manual)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/', auth, async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, leaveType, leaveReason, notes } = req.body;
    if (!employee || !date || !status) {
      return res.status(400).json({ message: 'employee, date, status are required' });
    }

    const day = startOfDay(date);
    const existing = await Attendance.findOne({ employee, date: day });
    if (existing) {
      return res.status(400).json({ message: 'Record already exists for this date.' });
    }

    const workHours = checkIn && checkOut
      ? parseFloat(((new Date(checkOut) - new Date(checkIn)) / 3600000).toFixed(2))
      : 0;

    const record = await Attendance.create({
      employee,
      date:       day,
      status,
      checkIn:    checkIn    ? new Date(checkIn)    : null,
      checkOut:   checkOut   ? new Date(checkOut)   : null,
      leaveType:  leaveType  || '',
      leaveReason: leaveReason || '',
      notes:      notes      || '',
      workHours,
    });

    await record.populate(POPULATE);
    res.status(201).json(record);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;