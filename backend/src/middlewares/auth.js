const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate user via JWT
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach payload to request object (usually { userId, role })
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
};

/**
 * Middleware to restrict access based on roles
 * @param {Array<string>|string} allowedRoles - 'ADMIN' or 'FACULTY'
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Forbidden: Access denied. No role found.' });
        }
        
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
        }

        next();
    };
};

module.exports = {
    authenticate,
    requireRole
};
