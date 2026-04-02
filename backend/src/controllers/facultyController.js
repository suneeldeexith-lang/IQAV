const prisma = require('../config/prisma');
const CourseChecklistService = require('../services/courseChecklistService');
const ActivityLogService = require('../services/activityLogService');
const CompletionService = require('../services/completionService');
const supabase = require('../config/supabase');

class FacultyController {
    
    /**
     * Retrieves all assigned courses for the logged-in faculty
     */
    static async getAssignedCourses(req, res) {
        try {
            const facultyId = req.user.userId;
            
            const courses = await prisma.course.findMany({
                where: { faculty_id: facultyId },
                orderBy: { created_at: 'desc' }
            });
            
            res.status(200).json({ courses });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching assigned courses.' });
        }
    }

    /**
     * Retrieves specific course checklist items based on Course ID
     */
    static async getCourseChecklist(req, res) {
        try {
            const { courseId } = req.params;
            const facultyId = req.user.userId;

            // Verify Ownership
            const course = await prisma.course.findUnique({ where: { course_id: courseId } });
            if (!course || course.faculty_id !== facultyId) {
                return res.status(403).json({ error: 'Access denied to this course.' });
            }

            // Fetch global master checklist and map with specific statuses
            const masterChecklist = await prisma.checklistMaster.findMany();
            const statuses = await prisma.courseChecklist.findMany({
                where: { course_id: courseId },
                include: { submissions: true }
            });

            // Map standard statuses to master items
            const mappedChecklist = masterChecklist.map(item => {
                const statusRecord = statuses.find(s => s.checklist_id === item.checklist_id);
                return {
                    ...item,
                    status_record: statusRecord || null
                };
            });

            res.status(200).json({
                course,
                checklist: mappedChecklist
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching course checklist.' });
        }
    }

    /**
     * Handle File Upload to a specific checklist item
     */
    static async uploadFiles(req, res) {
        try {
            const { courseId, checklistId } = req.params;
            const facultyId = req.user.userId;

            // 1. Ownership & Lock Check
            await FacultyController._verifyCourseOwnership(courseId, facultyId);

            // Get or create checklist wrapper allowing us to lock checks
            const statusRecord = await CourseChecklistService.getOrCreateChecklistStatus(courseId, checklistId);
            
            if (statusRecord.status === 'APPROVED') {
                return res.status(403).json({ error: 'Locked: This checklist item is already approved.' });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files provided for upload.' });
            }

            const uploadPromises = req.files.map(async (file) => {
                // Buffer to Supabase
                const publicUrl = await CourseChecklistService.uploadFileToSupabase(
                    file.buffer, 
                    file.originalname, 
                    file.mimetype
                );

                // Record in DB
                return prisma.submission.create({
                    data: {
                        course_checklist_id: statusRecord.id,
                        file_url: publicUrl,
                        file_name: file.originalname
                    }
                });
            });

            const savedSubmissions = await Promise.all(uploadPromises);

            // Ensure status transitions out of REJECTED or keeps PENDING if newly uploaded
            if (statusRecord.status === 'REJECTED') {
                await prisma.courseChecklist.update({
                    where: { id: statusRecord.id },
                    data: { status: 'PENDING' }
                });
            }

            // Log activity
            await ActivityLogService.logAction(facultyId, 'UPLOAD_FILE', 'SUBMISSION', statusRecord.id, { 
                courseId, 
                checklistId,
                filesUploaded: savedSubmissions.length
            });

            res.status(200).json({ message: 'Files uploaded successfully.', submissions: savedSubmissions });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: error.message || 'Error processing uploads.' });
        }
    }

    /**
     * Delete a stored submission
     */
    static async deleteSubmission(req, res) {
        try {
            const { submissionId } = req.params;
            const facultyId = req.user.userId;

            const submission = await prisma.submission.findUnique({
                where: { submission_id: submissionId },
                include: { course_checklist: true }
            });

            if (!submission) return res.status(404).json({ error: 'Submission not found' });

            await FacultyController._verifyCourseOwnership(submission.course_checklist.course_id, facultyId);

            if (submission.course_checklist.status === 'APPROVED') {
                return res.status(403).json({ error: 'Locked: Cannot delete an approved file.' });
            }

            // Storage cleanup 
            // Optional: Extract path from URL to delete from bucket using supabase.storage.from('bucket').remove(['path'])
            // Skipping storage explicit removal for prototype speed, just cascade DB

            await prisma.submission.delete({ where: { submission_id: submissionId } });

            await ActivityLogService.logAction(facultyId, 'DELETE_FILE', 'SUBMISSION', submissionId, {
               fileName: submission.file_name
            });

            res.status(200).json({ message: 'Submission deleted.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting submission.' });
        }
    }

    /**
     * Submits a checklist item for admin review
     */
    static async submitChecklist(req, res) {
        try {
            const { courseId, checklistId } = req.params;
            const { remarks } = req.body;
            const facultyId = req.user.userId;

            await FacultyController._verifyCourseOwnership(courseId, facultyId);

            const statusRecord = await CourseChecklistService.getOrCreateChecklistStatus(courseId, checklistId);

            if (statusRecord.status === 'APPROVED') {
                return res.status(403).json({ error: 'Locked: Already approved.' });
            }

            const updatedRecord = await prisma.courseChecklist.update({
                where: { id: statusRecord.id },
                data: {
                    status: 'SUBMITTED',
                    remarks: remarks || statusRecord.remarks,
                    submission_date: new Date()
                }
            });

            await ActivityLogService.logAction(facultyId, 'SUBMIT_CHECKLIST', 'COURSE_CHECKLIST', statusRecord.id, { 
                status: 'SUBMITTED', remarks 
            });

            res.status(200).json({ message: 'Checklist submitted for review.', record: updatedRecord });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error submitting checklist.' });
        }
    }

    // Helper method
    static async _verifyCourseOwnership(courseId, facultyId) {
        const course = await prisma.course.findUnique({ where: { course_id: courseId } });
        if (!course || course.faculty_id !== facultyId) {
            throw new Error('Access denied or course not found.');
        }
        return true;
    }
}

module.exports = FacultyController;
