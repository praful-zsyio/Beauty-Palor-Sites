const express = require('express');
const router = express.Router();
const { 
    sendContactEmail, 
    sendBatchEmails, 
    retrieveEmail, 
    updateEmail, 
    cancelEmail, 
    listEmails, 
    listAttachments, 
    retrieveAttachment 
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', sendContactEmail);

// Admin only routes
router.post('/batch', protect, authorize('admin'), sendBatchEmails);
router.get('/list', protect, authorize('admin'), listEmails); 
router.get('/:id', protect, authorize('admin'), retrieveEmail);
router.put('/:id', protect, authorize('admin'), updateEmail);
router.delete('/:id', protect, authorize('admin'), cancelEmail);
router.get('/:emailId/attachments', protect, authorize('admin'), listAttachments);
router.get('/:emailId/attachments/:id', protect, authorize('admin'), retrieveAttachment);

module.exports = router;
