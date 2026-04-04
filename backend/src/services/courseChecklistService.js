const prisma = require('../config/prisma');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class CourseChecklistService {

    /**
     * Find or create the checklist status row to guarantee it exists before upload
     */
    static async getOrCreateChecklistStatus(courseId, checklistId) {
        let statusRecord = await prisma.courseChecklist.findUnique({
            where: { course_id_checklist_id: { course_id: courseId, checklist_id: checklistId } }
        });

        if (!statusRecord) {
            statusRecord = await prisma.courseChecklist.create({
                data: {
                    course_id: courseId,
                    checklist_id: checklistId,
                    status: 'PENDING'
                }
            });
        }
        return statusRecord;
    }

    /**
     * Handle the streaming of a Multer file to Supabase Storage
     */
    static async uploadFileToSupabase(fileBuffer, originalName, mimetype) {
        const bucket = process.env.SUPABASE_BUCKET_NAME || 'course-files';
        const fileExt = originalName.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        const { data, error } = await supabase
            .storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                contentType: mimetype,
                upsert: false
            });

        if (error) {
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Return public URL (requires bucket to be public, or use authenticated signed URLs later)
        const { data: publicUrlData } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }
    
    /**
     * Logic to prevent faculty from uploading if already approved
     */
    static async checkSubmissionLock(courseId, checklistId) {
        const record = await prisma.courseChecklist.findUnique({
            where: { course_id_checklist_id: { course_id: courseId, checklist_id: checklistId } }
        });

        if (record && record.status === 'APPROVED') {
            throw new Error('This checklist item has already been approved and is locked.');
        }
        
        return record;
    }
}

module.exports = CourseChecklistService;
