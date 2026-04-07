const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middlewares/auth');

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/courses', AdminController.getAllCourses);
router.get('/courses/:courseId', AdminController.getCourseDetails);
router.get('/courses/:courseId/checklist/:checklistId/history', AdminController.getSubmissionHistory);
router.patch('/checklist/:id/status', AdminController.updateChecklistStatus);
router.delete('/submissions/:submissionId', AdminController.deleteSubmission);
router.get('/courses/:courseId/download-zip', AdminController.downloadCourseZip);

module.exports = router;
