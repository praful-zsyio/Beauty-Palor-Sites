const { db } = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
        const pendingAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get().count;
        const upcomingAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status IN ('pending', 'confirmed')").get().count;
        const completedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get().count;
        const totalRevenue = db.prepare("SELECT SUM(total_amount) as sum FROM appointments WHERE status = 'completed'").get().sum || 0;
        
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
        const totalServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE is_active = 1').get().count;
        
        // Recent appointments
        const recentAppointments = db.prepare(`
            SELECT a.*, s.name as serviceName 
            FROM appointments a 
            LEFT JOIN services s ON a.service_id = s.id 
            ORDER BY a.created_at DESC LIMIT 5
        `).all();

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalAppointments,
                    pendingAppointments,
                    upcomingAppointments,
                    completedAppointments,
                    totalRevenue,
                    totalUsers,
                    totalServices
                },
                recentAppointments
            }
        });
    } catch (error) {
        next(error);
    }
};
