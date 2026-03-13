const { db } = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
        const pendingAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get().count;
        const confirmedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'").get().count;
        const inProgressAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'in-progress'").get().count;
        const completedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get().count;
        const cancelledAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get().count;
        const noShowAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'no-show'").get().count;

        const totalRevenue = db.prepare("SELECT SUM(total_amount) as sum FROM appointments WHERE status = 'completed'").get().sum || 0;
        
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
        const totalServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE is_active = 1').get().count;
        
        // Count enquiries if table exists (optional, safely check)
        let totalEnquiries = 0;
        try {
            totalEnquiries = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;
        } catch (e) {
            // Enquiries might be in Excel only for now
        }
        
        // Recent appointments
        const recentAppointments = db.prepare(`
            SELECT a.*, s.name as serviceName 
            FROM appointments a 
            LEFT JOIN services s ON a.service_id = s.id 
            ORDER BY a.created_at DESC LIMIT 10
        `).all();

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalAppointments,
                    pendingAppointments,
                    confirmedAppointments,
                    inProgressAppointments,
                    completedAppointments,
                    cancelledAppointments,
                    noShowAppointments,
                    totalRevenue,
                    totalUsers,
                    totalServices,
                    totalEnquiries
                },
                recentAppointments
            }
        });
    } catch (error) {
        next(error);
    }
};
