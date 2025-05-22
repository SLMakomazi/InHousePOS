const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify', authController.verifyToken); // New route for token verification

module.exports = router;