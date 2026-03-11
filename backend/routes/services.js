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

// 1. PUBLIC ROUTES (MUST BE FIRST)
router.get('/categories', getCategories);
router.get('/', (req, res, next) => {
    console.log('[DEBUG] Public GET /api/services called');
    getServices(req, res, next);
});
router.get('/:id', getService);

// 2. AUTHENTICATED ROUTES
router.post('/:id/reviews', protect, addReview);

// 3. ADMIN ONLY ROUTES
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
