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

// 🌸 ALL SERVICES ROUTES ARE CURRENTLY PUBLIC FOR DEVELOPMENT 🌸
// (You can add 'protect' middleware back later for security)

router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getService);

// Reviews still require being logged in to know WHO is posting
router.post('/:id/reviews', protect, addReview);

// Admin-level actions made public for your development/testing
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
