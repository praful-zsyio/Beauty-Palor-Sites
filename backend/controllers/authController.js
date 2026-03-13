const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
    const token = User.getSignedJwtToken(user);
    const options = {
        expires: new Date(Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    const safeUser = User.safeUser(user);
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            _id: safeUser.id,
            name: safeUser.name,
            email: safeUser.email,
            phone: safeUser.phone,
            role: safeUser.role,
            avatar: safeUser.avatar,
            loyaltyPoints: safeUser.loyalty_points,
        },
    });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        // role defaults to 'customer' in User model if not provided
        const user = await User.create({ name, email, password, phone, role });
        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        const user = User.findByEmail(email);
        if (!user || !(await User.matchPassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @route GET /api/auth/logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = User.findById(req.user.id);
        res.status(200).json({ success: true, user: User.safeUser(user) });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/auth/updateprofile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const user = User.update(req.user.id, { name, email, phone });
        res.status(200).json({ success: true, user: User.safeUser(user) });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/auth/updatepassword
exports.updatePassword = async (req, res, next) => {
    try {
        const user = User.findById(req.user.id);
        if (!(await User.matchPassword(req.body.currentPassword, user.password))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        await User.updatePassword(req.user.id, req.body.newPassword);
        const updatedUser = User.findById(req.user.id);
        sendTokenResponse(updatedUser, 200, res);
    } catch (error) {
        next(error);
    }
};
