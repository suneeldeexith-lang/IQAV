const express = require('express');

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const facultyRoutes = require('./facultyRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);

module.exports = router;
