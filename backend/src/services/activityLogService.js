const prisma = require('../config/prisma');

/**
 * Service to handle activity logging
 */
class ActivityLogService {
    /**
     * Creates a new activity log entry
     * @param {string} userId - User performing the action
     * @param {string} action - e.g., 'UPLOADED_FILE', 'APPROVED_CHECKLIST'
     * @param {string} entityType - e.g., 'SUBMISSION', 'COURSE_CHECKLIST'
     * @param {string} entityId - UUID of the affected row
     * @param {string|object} [details] - Optional context
     */
    static async logAction(userId, action, entityType, entityId, details = null) {
        try {
            await prisma.activityLog.create({
                data: {
                    user_id: userId,
                    action,
                    entity_type: entityType,
                    entity_id: entityId,
                    details: details ? JSON.stringify(details) : null
                }
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
            // Non-blocking log failure
        }
    }
    
    /**
     * Get recent logs
     */
    static async getRecentLogs(limit = 50) {
        return prisma.activityLog.findMany({
            take: limit,
            orderBy: { created_at: 'desc' },
            include: { user: { select: { name: true, email: true, role: true } } }
        });
    }
}

module.exports = ActivityLogService;
