const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const ALL_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM',
];

// @route POST /api/appointments
exports.createAppointment = async (req, res, next) => {
    try {
        const { serviceId, date, timeSlot, notes, specialRequests, customerName, customerEmail, customerPhone, paymentMethod, staffId } = req.body;

        if (!serviceId || !date || !timeSlot || !customerName || !customerEmail || !customerPhone) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const service = Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        // Check conflict
        const conflict = Appointment.checkConflict(date, timeSlot, staffId);
        if (conflict) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

        const amount = service.discountedPrice || service.price;
        const taxAmount = Math.round(amount * 0.18 * 100) / 100;
        const totalAmount = Math.round((amount + taxAmount) * 100) / 100;

        const appointment = Appointment.create({
            user_id: req.user.id,
            service_id: Number(serviceId),
            staff_id: staffId ? Number(staffId) : null,
            date,
            time_slot: timeSlot,
            notes,
            special_requests: specialRequests,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            amount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            payment_method: paymentMethod || 'cash',
        });

        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/appointments/my
exports.getMyAppointments = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;
        const result = Appointment.findByUser(req.user.id, { status, page, limit });
        res.status(200).json({
            success: true,
            count: result.appointments.length,
            total: result.total,
            totalPages: result.totalPages,
            data: result.appointments,
        });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/appointments/:id
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        if (appointment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointment = Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        if (appointment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({ success: false, message: `Appointment is already ${appointment.status}` });
        }
        const updated = Appointment.cancel(req.params.id, req.body.reason || 'Cancelled by user', req.user.role);
        res.status(200).json({ success: true, data: updated, message: 'Appointment cancelled successfully' });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/appointments/admin/all (Admin)
exports.getAllAppointments = async (req, res, next) => {
    try {
        const { status, date, page, limit } = req.query;
        const result = Appointment.findAll({ status, date, page, limit });
        res.status(200).json({ success: true, count: result.appointments.length, total: result.total, data: result.appointments });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/appointments/:id/status (Admin/Staff)
exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const updated = Appointment.updateStatus(req.params.id, req.body.status);
        if (!updated) return res.status(404).json({ success: false, message: 'Appointment not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/appointments/slots
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { date, serviceId } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

        const { db } = require('../config/db');
        const dateStart = Math.floor(new Date(date).setHours(0, 0, 0, 0) / 1000);
        const dateEnd = dateStart + 86400;

        const booked = db.prepare(`
      SELECT time_slot FROM appointments
      WHERE date >= ? AND date < ? AND status != 'cancelled'
    `).all(dateStart, dateEnd).map(r => r.time_slot);

        const available = ALL_SLOTS.filter(s => !booked.includes(s));
        res.status(200).json({ success: true, data: available });
    } catch (error) {
        next(error);
    }
};
