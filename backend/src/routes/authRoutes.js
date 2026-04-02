const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/login', AuthController.login);

router.get('/me', authenticate, AuthController.getProfile);

module.exports = router;
