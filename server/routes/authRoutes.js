// routes/authRoutes.js - Authentication & Admin Endpoints
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

// Admin Auth & Portal Data
router.post('/admin-login', authController.adminLogin);
router.get('/admin-me', authController.adminMe);
router.post('/admin-logout', authController.adminLogout);
router.get('/customers', authController.getCustomers);
router.get('/stats', authController.getStats);

module.exports = router;
