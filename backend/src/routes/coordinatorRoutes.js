const express = require('express');
const router = express.Router();
const CoordinatorController = require('../controllers/coordinatorController');
const { authenticate, requireRole } = require('../middlewares/auth');

router.use(authenticate);
router.use(requireRole('COORDINATOR'));

router.get('/courses', CoordinatorController.getMyCourses);
router.get('/courses/:courseId', CoordinatorController.getCourseDetails);
router.patch('/checklist/:id/status', CoordinatorController.updateChecklistStatus);

module.exports = router;
