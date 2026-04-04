const express = require('express');

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const facultyRoutes = require('./facultyRoutes');

const router = express.Router();

const prisma = require('../config/prisma');

router.get('/health', async (req, res) => {
  try {
    // Try a simple query to assert DB health
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', database: 'connected', timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', database: 'disconnected', timestamp: new Date() });
  }
});


router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);

module.exports = router;
