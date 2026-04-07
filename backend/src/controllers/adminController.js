const prisma = require('../config/prisma');
const archiver = require('archiver');
const ActivityLogService = require('../services/activityLogService');
const CompletionService = require('../services/completionService');

class AdminController {

    /**
     * Return high-level dashboard metrics
     */
    static async getDashboardMetrics(req, res) {
        try {
            const [totalCourses, totalFaculty, pendingReviews, allCourses] = await Promise.all([
                prisma.course.count(),
                prisma.user.count({ where: { role: 'FACULTY' } }),
                prisma.courseChecklist.count({ where: { status: 'COORDINATOR_APPROVED' } }),
                prisma.course.findMany({ select: { completion_percentage: true } }),
            ]);

            const overallCompliance = allCourses.length > 0
                ? Math.round(allCourses.reduce((sum, c) => sum + Number(c.completion_percentage), 0) / allCourses.length)
                : 0;

            const recentActivities = await prisma.activityLog.findMany({
                take: 10,
                orderBy: { created_at: 'desc' },
                include: { user: { select: { name: true } } }
            });

            res.status(200).json({
                totalCourses,
                totalFaculty,
                pendingReviews,
                overallCompliance,
                recent_logs: recentActivities
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
        }
    }

    /**
     * Get all courses with current calculations
     */
    static async getAllCourses(req, res) {
        try {
            const courses = await prisma.course.findMany({
                include: {
                    faculty: { select: { name: true, email: true } }
                },
                orderBy: { created_at: 'desc' }
            });

            res.status(200).json({ courses });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch courses.' });
        }
    }

    /**
     * Get detailed checklist view for admin to review
     */
    static async getCourseDetails(req, res) {
        try {
            const { courseId } = req.params;

            const course = await prisma.course.findUnique({
                where: { course_id: courseId },
                include: { faculty: { select: { name: true, email: true } } }
            });

            if (!course) return res.status(404).json({ error: 'Course not found.' });

            const masterChecklist = await prisma.checklistMaster.findMany();
            const statuses = await prisma.courseChecklist.findMany({
                where: { course_id: courseId },
                include: { submissions: true }
            });

            const checklistWithFiles = masterChecklist.map(item => {
                const statusRecord = statuses.find(s => s.checklist_id === item.checklist_id);
                return {
                    ...item,
                    status_record: statusRecord || null
                };
            });

            res.status(200).json({
                course,
                checklist: checklistWithFiles
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch course details.' });
        }
    }

    /**
     * Approves or Rejects a checklist item + Calculates Completion %
     */
    static async updateChecklistStatus(req, res) {
        try {
            const { id } = req.params; // course_checklist_id
            const { status, remarks } = req.body;
            const adminId = req.user.userId;

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
            }

            // Using transaction ensures we don't end up in an uncertain state
            const updatedRecord = await prisma.$transaction(async (tx) => {
                const record = await tx.courseChecklist.findUnique({ where: { id } });
                if (!record) throw new Error('Checklist status record not found.');

                if (record.status !== 'COORDINATOR_APPROVED' && status === 'APPROVED') {
                    throw new Error('Item must be approved by Course Coordinator before IQAC final approval.');
                }

                const update = await tx.courseChecklist.update({
                    where: { id },
                    data: { status, remarks }
                });

                return update;
            });

            // Trigger Recalculate
            await CompletionService.recalculateCourseCompletion(updatedRecord.course_id);

            // Log action
            await ActivityLogService.logAction(adminId, `ADMIN_${status}`, 'COURSE_CHECKLIST', id, { 
                remarks 
            });

            res.status(200).json({ message: `Status updated to ${status}.`, record: updatedRecord });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message || 'Failed to update checklist status.' });
        }
    }

    /**
     * Zip up all files uploaded for an approved/submitted course
     */
    static async downloadCourseZip(req, res) {
        try {
            const { courseId } = req.params;

            const submissions = await prisma.submission.findMany({
                where: {
                    course_checklist: { course_id: courseId } // Fetch all regardless of status, or enforce { status: 'APPROVED' } if needed
                },
                include: { course_checklist: { include: { checklist_item: true } } }
            });

            if (submissions.length === 0) {
                return res.status(404).json({ error: 'No files available to download for this course.' });
            }

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="Course_${courseId}_Export.zip"`);

            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
            archive.on('error', (err) => { throw err; });

            archive.pipe(res);

            // Supabase GET requests for streaming files into archive
            // In a real application we download via axios/fetch streams and append to archiver
            for (const file of submissions) {
                // Grouping zip internally by category
                const category = file.course_checklist.checklist_item.category;
                const fileName = `${category}/${file.file_name}`;

                try {
                    // Fetch directly from the public URL. 
                    // Note: Use node-fetch or native fetch to grab buffer streams.
                    const response = await fetch(file.file_url);
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        archive.append(Buffer.from(buffer), { name: fileName });
                    }
                } catch (fetchErr) {
                    console.error("Skipped a file in Zip Generation due to error:", fetchErr);
                }
            }

            await archive.finalize();

            await ActivityLogService.logAction(req.user.userId, 'DOWNLOAD_COURSE_ZIP', 'COURSE', courseId);
            
            // Note: res.send() is not necessary because the zip is piped
        } catch (error) {
            console.error(error);
            if (!res.headersSent) res.status(500).json({ error: 'Failed to generate ZIP.' });
        }
    }
    /**
     * Get submission history per checklist item
     */
    static async getSubmissionHistory(req, res) {
        try {
            const { courseId, checklistId } = req.params;

            const statusRecord = await prisma.courseChecklist.findUnique({
                where: { course_id_checklist_id: { course_id: courseId, checklist_id: checklistId } }
            });

            if (!statusRecord) return res.status(200).json({ history: [] });

            const history = await prisma.submission.findMany({
                where: { course_checklist_id: statusRecord.id },
                orderBy: { version: 'desc' },
                include: { uploader: { select: { name: true, role: true } } }
            });

            res.status(200).json({ history });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching history.' });
        }
    }
}

module.exports = AdminController;
