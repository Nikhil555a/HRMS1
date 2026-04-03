
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded has { id, type } — type is 'user' or 'employee'
    if (decoded.type === 'employee') {
      const employee = await Employee.findById(decoded.id).select('-password');
      if (!employee) return res.status(401).json({ message: 'Token is not valid' });
      req.user = { ...employee.toObject(), type: 'employee', id: employee._id };
    } else {
      // Legacy tokens without type field default to user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'Token is not valid' });
      req.user = { ...user.toObject(), type: 'user', id: user._id };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};