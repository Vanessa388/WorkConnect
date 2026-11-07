// routes/reportRoutes.js - Endpoints for Customer Reports & Moderation
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// POST /api/reports - Customer submits a report against a worker
router.post('/', reportController.createReport);

// GET /api/reports - Admin fetches all reports
router.get('/', reportController.getAllReports);

// PATCH /api/reports/:id - Admin updates status of a report (pending, resolved, dismissed)
router.patch('/:id', reportController.updateReport);

module.exports = router;

