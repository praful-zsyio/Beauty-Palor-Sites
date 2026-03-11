const express = require('express');
const router = express.Router();
const {
    getServices, getService, createService, updateService, deleteService, addReview, getCategories
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
