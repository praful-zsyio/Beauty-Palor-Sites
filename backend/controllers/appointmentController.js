const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { Resend } = require('resend');
const { logToExcel } = require('../utils/excelLogger');
const { syncToGoogleSheets } = require('../utils/googleSheets');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

        // Add loyalty points
        User.addLoyaltyPoints(req.user.id, 100);

        // ── Log to Excel ──────────────────────────────────────────────────────
        await logToExcel('Bookings', {
            id: appointment.appointment_id,
            date: new Date(date).toLocaleDateString('en-IN'),
            time: timeSlot,
            service: service.name,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            amount: totalAmount,
            status: 'pending'
        });

        await syncToGoogleSheets('Bookings', {
            id: appointment.appointment_id,
            date: new Date(date).toLocaleDateString('en-IN'),
            time: timeSlot,
            service: service.name,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            amount: totalAmount,
            status: 'pending'
        });

        // ── Send Email Notification ───────────────────────────────────────────
        const ownerEmails = (process.env.EMAIL_TO || 'prafulsonwane58@gmail.com,kiranbeautysalon@gmail.com').split(',').map(e => e.trim());
        const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f6f3f8;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#f43f5e,#e11d48);padding:30px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:22px;">New Appointment Booking! 🌸</h1>
      <p style="margin:5px 0 0;opacity:0.9;">Appointment ID: ${appointment.appointment_id}</p>
    </div>
    <div style="padding:30px;">
      <h3 style="color:#1a1a2e;border-bottom:1px solid #eee;padding-bottom:10px;">Customer Details</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      
      <h3 style="color:#1a1a2e;border-bottom:1px solid #eee;padding-bottom:10px;margin-top:25px;">Appointment Details</h3>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN')}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
      <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
    </div>
    <div style="background:#1a1a2e;color:rgba(255,255,255,0.6);padding:15px;text-align:center;font-size:12px;">
      © 2025 Kiran Beauty Salon & Academy · Sent at ${now}
    </div>
  </div>
</body>
</html>`;

        const visitorHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f6f3f8;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#f43f5e,#e11d48);padding:30px;text-align:center;color:#fff;">
      <p style="font-size:30px;margin:0;">🌸</p>
      <h1 style="margin:10px 0 0;font-size:22px;">Booking Confirmed!</h1>
      <p style="margin:5px 0 0;opacity:0.9;">Hi ${customerName}, we're excited to see you!</p>
    </div>
    <div style="padding:30px;">
      <p style="color:#374151;font-size:16px;">Your appointment at <strong>Kiran Beauty Salon & Academy</strong> has been successfully booked.</p>
      
      <div style="background:#fdf2f4;padding:20px;border-radius:12px;margin:20px 0;border-left:4px solid #f43f5e;">
        <h3 style="margin:0 0 10px;color:#1a1a2e;">Appointment Details</h3>
        <p style="margin:5px 0;"><strong>Service:</strong> ${service.name}</p>
        <p style="margin:5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN')}</p>
        <p style="margin:5px 0;"><strong>Time:</strong> ${timeSlot}</p>
        <p style="margin:5px 0;"><strong>Amount:</strong> ₹${totalAmount}</p>
      </div>

      <p style="color:#6b7280;font-size:14px;"><strong>Location:</strong> Men Corner, Kaka Complex, Pithampur, MP 454775</p>
      <p style="color:#6b7280;font-size:14px;"><strong>Contact:</strong> +91 6265175996</p>
      
      <p style="margin-top:25px;font-style:italic;color:#374151;">Need to reschedule? Please contact us at least 24 hours in advance.</p>
    </div>
    <div style="background:#1a1a2e;color:rgba(255,255,255,0.6);padding:15px;text-align:center;font-size:12px;">
      © 2025 Kiran Beauty Salon & Academy
    </div>
  </div>
</body>
</html>`;

        if (resend) {
            try {
                // Send to Salon Owner(s)
                await resend.emails.send({
                from: `Kiran Beauty Salon <${fromAddress}>`,
                to: ownerEmails,
                replyTo: customerEmail,
                subject: `📅 New Booking: ${service.name} — ${customerName}`,
                html: emailHtml,
            });

            // Send to Customer (Auto-reply)
            await resend.emails.send({
                from: `Kiran Beauty Salon <${fromAddress}>`,
                to: [customerEmail],
                subject: `✅ Booking Confirmed: ${service.name} — Kiran Beauty Salon`,
                html: visitorHtml,
            });
        } catch (emailErr) {
                console.error('Failed to send appointment notification email:', emailErr.message);
            }
        } else {
            console.log('ℹ️  Email skipped: RESEND_API_KEY not configured');
        }

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
