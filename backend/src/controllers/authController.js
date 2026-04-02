const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    /**
     * Authenticates a user and issues a JWT token
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // Create JWT Payload
            const payload = {
                userId: user.user_id,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error during login.' });
        }
    }

    /**
     * Gets the current user profile based on JWT token
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            return res.status(200).json({ user });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ error: 'Internal server error fetching profile.' });
        }
    }
}

module.exports = AuthController;
