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
        const safeUser = User.safeUser(user);
        res.status(200).json({
            success: true,
            user: {
                _id: safeUser.id,
                name: safeUser.name,
                email: safeUser.email,
                phone: safeUser.phone,
                role: safeUser.role,
                avatar: safeUser.avatar,
                loyaltyPoints: safeUser.loyalty_points,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/auth/updateprofile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const user = User.update(req.user.id, { name, email, phone });
        const safeUser = User.safeUser(user);
        res.status(200).json({
            success: true,
            user: {
                _id: safeUser.id,
                name: safeUser.name,
                email: safeUser.email,
                phone: safeUser.phone,
                role: safeUser.role,
                avatar: safeUser.avatar,
                loyaltyPoints: safeUser.loyalty_points,
            }
        });
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

// @route POST /api/auth/firebase
// Handles Firebase user sign in / registration for Client and Admin sites (Google Sign-In & Email)
exports.firebaseAuth = async (req, res, next) => {
    try {
        const { email, name, phone, firebaseUid, role = 'customer', isAdminRequest } = req.body;

        // Automatically resolve email so it NEVER rejects valid Google Sign-In or Firebase requests
        let normalizedEmail = '';
        if (email && typeof email === 'string' && email.trim().length > 0) {
            normalizedEmail = email.trim().toLowerCase();
        } else if (phone && typeof phone === 'string' && phone.replace(/[^0-9]/g, '').length > 0) {
            normalizedEmail = `${phone.replace(/[^0-9]/g, '')}@phone.shivanibeauty.com`;
        } else if (firebaseUid && typeof firebaseUid === 'string' && firebaseUid.trim().length > 0) {
            normalizedEmail = `google_${firebaseUid.slice(0, 16)}@shivanibeauty.com`;
        } else {
            normalizedEmail = `client_${Date.now()}@shivanibeauty.com`;
        }

        const normalizedName = (name && typeof name === 'string' && name.trim()) || (email ? email.split('@')[0] : 'Shivani Beauty Client');
        const assignedRole = (role === 'admin' || isAdminRequest) ? 'admin' : 'customer';

        // Find existing user by email or phone
        let user = User.findByEmail(normalizedEmail);
        if (!user && phone) {
            const { db } = require('../config/db');
            user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
        }

        if (!user) {
            const randomPassword = 'FB_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
            user = await User.create({
                name: normalizedName,
                email: normalizedEmail,
                password: randomPassword,
                phone: phone || null,
                role: assignedRole
            });
        } else {
            // Update name, phone or role if requested
            const updates = {};
            if (name && (!user.name || user.name === 'User' || user.name.startsWith('User ') || user.name.includes('Client'))) {
                updates.name = normalizedName;
            }
            if (phone && !user.phone) {
                updates.phone = phone;
            }
            if ((role === 'admin' || isAdminRequest) && user.role !== 'admin') {
                updates.role = 'admin';
            }
            if (Object.keys(updates).length > 0) {
                user = User.update(user.id, updates);
            }
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @route GET /api/auth/firebase-config
exports.getFirebaseConfig = (req, res) => {
    res.status(200).json({
        success: true,
        vapidKey: process.env.FIREBASE_VAPID_KEY || 'BF0f9rGlXdMqwa0NbNZfxpOcyGVK7m0ojb-9DCYkIAlF6bOJIqmPQyMs0v-7rEipTorYSMq8aoXV187_eiz6i3k',
        projectId: process.env.FIREBASE_PROJECT_ID || 'beauty-paloir',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'beauty-paloir.firebaseapp.com'
    });
};

