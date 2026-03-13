const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here should be admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

module.exports = router;
