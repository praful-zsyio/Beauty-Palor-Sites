const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    addReview,
    getCategories
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (No authentication required)
router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getService);

// Protected routes (Requires authentication)
router.post('/:id/reviews', protect, addReview);

// Admin only routes (Requires admin role)
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
