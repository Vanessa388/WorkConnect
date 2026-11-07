// routes/workerRoutes.js - Endpoints for Artisans & Workers
const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

// GET /api/workers - List workers (?all=true for all, ?status=pending for pending, default=verified only)
router.get('/', workerController.getAllWorkers);

// GET /api/workers/search - Search verified workers
router.get('/search', workerController.searchWorkers);

// POST /api/workers/upload - Upload artisan photo to Cloudinary
router.post('/upload', workerController.uploadImage);

// GET /api/workers/:id - Single worker details
router.get('/:id', workerController.getWorkerById);

// PUT /api/workers/:id - Update worker profile
router.put('/:id', workerController.updateWorker);

// PATCH /api/workers/:id/verify - Admin approves or rejects worker profile
router.patch('/:id/verify', workerController.verifyWorker);

// PATCH /api/workers/:id/ban - Admin bans or unbans worker profile
router.patch('/:id/ban', workerController.banWorker);

// GET /api/workers/:id/reviews - Get reviews for worker
router.get('/:id/reviews', workerController.getWorkerReviews);

// POST /api/workers/:id/reviews - Submit review for worker
router.post('/:id/reviews', workerController.createReview);

// POST /api/workers - Add a new worker (defaults to pending verification)
router.post('/', workerController.createWorker);

module.exports = router;
