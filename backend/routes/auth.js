const express = require('express');
const router = express.Router();
const {
    register, login, logout, getMe, updateProfile, updatePassword,
    firebaseAuth, getFirebaseConfig
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.get('/firebase-config', getFirebaseConfig);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
