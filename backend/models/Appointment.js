const { db, generateAppointmentId } = require('../config/db');

const parseAppointment = (a) => {
    if (!a) return null;
    return {
        ...a,
        _id: a.id,
        appointmentId: a.appointment_id,
        payment: {
            amount: a.amount,
            discountAmount: a.discount_amount,
            taxAmount: a.tax_amount,
            totalAmount: a.total_amount,
            method: a.payment_method,
            status: a.payment_status,
            transactionId: a.transaction_id,
            paidAt: a.paid_at,
        },
        cancellation: a.cancel_reason ? {
            reason: a.cancel_reason,
            cancelledBy: a.cancelled_by,
            cancelledAt: a.cancelled_at,
            refundAmount: a.refund_amount,
            refundStatus: a.refund_status,
        } : null,
    };
};

const Appointment = {
    create: ({ user_id, service_id, date, time_slot, notes, special_requests, customer_name, customer_email, customer_phone, amount, tax_amount, total_amount, payment_method, staff_id }) => {
        const appointmentId = generateAppointmentId();
        const stmt = db.prepare(`
      INSERT INTO appointments
        (appointment_id, user_id, service_id, staff_id, date, time_slot, notes, special_requests,
         customer_name, customer_email, customer_phone,
         amount, tax_amount, total_amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            appointmentId, user_id, service_id, staff_id || null,
            Math.floor(new Date(date).getTime() / 1000), time_slot,
            notes || null, special_requests || null,
            customer_name, customer_email, customer_phone,
            amount, tax_amount, total_amount, payment_method || 'cash'
        );
        return Appointment.findById(result.lastInsertRowid);
    },

    findById: (id) => {
        const a = db.prepare(`
      SELECT apt.*, s.name as service_name, s.category as service_category,
             s.price as service_price, s.duration as service_duration, s.thumbnail as service_thumbnail
      FROM appointments apt
      LEFT JOIN services s ON apt.service_id = s.id
      WHERE apt.id = ?
    `).get(id);
        if (!a) return null;
        const apt = parseAppointment(a);
        apt.service = { _id: a.service_id, name: a.service_name, category: a.service_category, price: a.service_price, duration: a.service_duration, thumbnail: a.service_thumbnail };
        return apt;
    },

    findByUser: (userId, { status, page = 1, limit = 10 } = {}) => {
        let where = ['apt.user_id = ?'];
        let params = [userId];
        if (status) { where.push('apt.status = ?'); params.push(status); }

        const whereStr = `WHERE ${where.join(' AND ')}`;
        const offset = (Number(page) - 1) * Number(limit);
        const total = db.prepare(`SELECT COUNT(*) as count FROM appointments apt ${whereStr}`).get(...params).count;

        const rows = db.prepare(`
      SELECT apt.*, s.name as service_name, s.category as service_category,
             s.price as service_price, s.duration as service_duration, s.thumbnail as service_thumbnail
      FROM appointments apt
      LEFT JOIN services s ON apt.service_id = s.id
      ${whereStr} ORDER BY apt.date DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

        return {
            appointments: rows.map(a => {
                const apt = parseAppointment(a);
                apt.service = { _id: a.service_id, name: a.service_name, category: a.service_category, price: a.service_price, duration: a.service_duration, thumbnail: a.service_thumbnail };
                return apt;
            }),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        };
    },

    findAll: ({ status, date, page = 1, limit = 20 } = {}) => {
        let where = [];
        let params = [];
        if (status) { where.push('apt.status = ?'); params.push(status); }
        if (date) {
            const d = Math.floor(new Date(date).setHours(0, 0, 0, 0) / 1000);
            const dEnd = d + 86400;
            where.push('apt.date >= ? AND apt.date < ?');
            params.push(d, dEnd);
        }
        const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const offset = (Number(page) - 1) * Number(limit);
        const total = db.prepare(`SELECT COUNT(*) as count FROM appointments apt ${whereStr}`).get(...params).count;
        const rows = db.prepare(`
      SELECT apt.*, s.name as service_name, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM appointments apt
      LEFT JOIN services s ON apt.service_id = s.id
      LEFT JOIN users u ON apt.user_id = u.id
      ${whereStr} ORDER BY apt.date DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

        return {
            appointments: rows.map(parseAppointment),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        };
    },

    updateStatus: (id, status) => {
        db.prepare(`UPDATE appointments SET status = ?, updated_at = strftime('%s','now') WHERE id = ?`).run(status, id);
        return Appointment.findById(id);
    },

    cancel: (id, reason, cancelledBy) => {
        const now = Math.floor(Date.now() / 1000);
        db.prepare(`
      UPDATE appointments SET status = 'cancelled', cancel_reason = ?, cancelled_by = ?, cancelled_at = ?, updated_at = ? WHERE id = ?
    `).run(reason, cancelledBy, now, now, id);
        return Appointment.findById(id);
    },

    checkConflict: (date, timeSlot, staffId) => {
        const dateTs = Math.floor(new Date(date).setHours(0, 0, 0, 0) / 1000);
        const dateEnd = dateTs + 86400;
        let query = `SELECT id FROM appointments WHERE date >= ? AND date < ? AND time_slot = ? AND status != 'cancelled'`;
        let params = [dateTs, dateEnd, timeSlot];
        if (staffId) { query += ' AND staff_id = ?'; params.push(staffId); }
        return db.prepare(query).get(...params);
    },
};

module.exports = Appointment;
