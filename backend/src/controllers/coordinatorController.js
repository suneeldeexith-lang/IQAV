const prisma = require('../config/prisma');
const ActivityLogService = require('../services/activityLogService');
const CompletionService = require('../services/completionService');

class CoordinatorController {

  // Get all courses this coordinator is responsible for
  static async getMyCourses(req, res) {
    try {
      const coordinatorId = req.user.userId;
      const courses = await prisma.course.findMany({
        where: { coordinator_id: coordinatorId },
        include: { faculty: { select: { name: true, email: true } } },
        orderBy: { course_code: 'asc' }
      });
      res.status(200).json({ courses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch courses.' });
    }
  }

  // Get checklist details for a course (coordinator view)
  static async getCourseDetails(req, res) {
    try {
      const { courseId } = req.params;
      const coordinatorId = req.user.userId;

      const course = await prisma.course.findFirst({
        where: { course_id: courseId, coordinator_id: coordinatorId },
        include: { faculty: { select: { name: true, email: true } } }
      });

      if (!course) return res.status(404).json({ error: 'Course not found or not assigned to you.' });

      const masterChecklist = await prisma.checklistMaster.findMany();
      const statuses = await prisma.courseChecklist.findMany({
        where: { course_id: courseId },
        include: { submissions: { where: { is_latest: true } } }
      });

      const checklistWithFiles = masterChecklist.map(item => {
        const statusRecord = statuses.find(s => s.checklist_id === item.checklist_id);
        return { ...item, status_record: statusRecord || null };
      });

      res.status(200).json({ course, checklist: checklistWithFiles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch course details.' });
    }
  }

  // Approve or reject a checklist item (coordinator final approval)
  static async updateChecklistStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const coordinatorId = req.user.userId;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
      }

      const record = await prisma.courseChecklist.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Record not found.' });

      if (record.status !== 'SUBMITTED') {
        return res.status(400).json({ error: 'Item must be submitted by faculty before coordinator review.' });
      }

      // Coordinator approves → becomes COORDINATOR_APPROVED (waiting for IQAC final approval)
      // Coordinator rejects → goes back to REJECTED
      const newStatus = status === 'APPROVED' ? 'COORDINATOR_APPROVED' : 'REJECTED';

      const updatedRecord = await prisma.courseChecklist.update({
        where: { id },
        data: {
          coordinator_status: status,
          coordinator_remarks: remarks || null,
          coordinator_reviewed_at: new Date(),
          status: newStatus,
        }
      });

      await CompletionService.recalculateCourseCompletion(updatedRecord.course_id);
      await ActivityLogService.logAction(coordinatorId, `COORDINATOR_${status}`, 'COURSE_CHECKLIST', id, { remarks });

      res.status(200).json({ message: `Status updated to ${status}.`, record: updatedRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to update status.' });
    }
  }
}

module.exports = CoordinatorController;
