const Service = require('../models/Service');

// @route GET /api/services
exports.getServices = async (req, res, next) => {
    console.log(`[API] GET /api/services hit at ${new Date().toISOString()}`);
    try {
        const { category, minPrice, maxPrice, search, sort, page, limit, featured, popular } = req.query;
        const result = Service.findAll({ category, minPrice, maxPrice, search, sort, page, limit, featured, popular });
        res.status(200).json({
            success: true,
            debug: "v3-public-access-confirmed",
            count: result.services.length,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            data: result.services,
        });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/services/categories
exports.getCategories = async (req, res, next) => {
    try {
        const stats = Service.getCategories();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/services/:id
exports.getService = async (req, res, next) => {
    try {
        const service = Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

// @route POST /api/services (Admin)
exports.createService = async (req, res, next) => {
    try {
        const service = Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/services/:id (Admin)
exports.updateService = async (req, res, next) => {
    try {
        const service = Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        const updated = Service.update(req.params.id, req.body);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @route DELETE /api/services/:id (Admin)
exports.deleteService = async (req, res, next) => {
    try {
        const service = Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        Service.deactivate(req.params.id);
        res.status(200).json({ success: true, message: 'Service deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

// @route POST /api/services/:id/reviews
exports.addReview = async (req, res, next) => {
    try {
        const service = Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        try {
            Service.addReview(req.params.id, req.user.id, req.user.name, Number(req.body.rating), req.body.comment);
            res.status(201).json({ success: true, message: 'Review added successfully' });
        } catch (err) {
            if (err.message === 'Already reviewed') {
                return res.status(400).json({ success: false, message: 'You have already reviewed this service' });
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};
