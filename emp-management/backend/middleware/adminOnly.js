module.exports = function adminOnly(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
