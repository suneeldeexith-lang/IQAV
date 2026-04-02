const express = require('express');
const router = express.Router();
const FacultyController = require('../controllers/facultyController');
const { authenticate, requireRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);
router.use(requireRole('FACULTY'));

router.get('/courses', FacultyController.getAssignedCourses);
router.get('/courses/:courseId', FacultyController.getCourseChecklist);
router.post('/courses/:courseId/checklist/:checklistId/upload', upload.array('files', 5), FacultyController.uploadFiles);
router.delete('/submissions/:submissionId', FacultyController.deleteSubmission);
router.patch('/courses/:courseId/checklist/:checklistId/submit', FacultyController.submitChecklist);

module.exports = router;
