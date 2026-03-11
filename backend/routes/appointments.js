const express = require('express');
const router = express.Router();
const {
    createAppointment, getMyAppointments, getAppointment, cancelAppointment,
    getAllAppointments, updateAppointmentStatus, getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', getAvailableSlots);
router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateAppointmentStatus);

module.exports = router;
