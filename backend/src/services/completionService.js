const prisma = require('../config/prisma');

class CompletionService {
    /**
     * Recalculates and updates the completion percentage of a course
     * @param {string} courseId - The UUID of the course
     */
    static async recalculateCourseCompletion(courseId) {
        try {
            // Count total REQUIRED checklist items in the master table
            const totalRequired = await prisma.checklistMaster.count({
                where: { required_flag: true }
            });

            if (totalRequired === 0) return 0;

            // Count how many of those required items are marked as 'APPROVED' for this course
            const completedItems = await prisma.courseChecklist.count({
                where: {
                    course_id: courseId,
                    status: { in: ['ADMIN_APPROVED', 'APPROVED'] },
                    checklist_item: { required_flag: true }
                }
            });

            const percentage = (completedItems / totalRequired) * 100;
            const finalPercentage = parseFloat(percentage.toFixed(2));

            // Update course
            await prisma.course.update({
                where: { course_id: courseId },
                data: { completion_percentage: finalPercentage }
            });

            return finalPercentage;
        } catch (error) {
            console.error("Error recalculating completion for course:", courseId, error);
            throw error;
        }
    }
}

module.exports = CompletionService;
