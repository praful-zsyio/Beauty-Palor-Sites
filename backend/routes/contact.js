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

// Public contact form
router.post('/', sendContactEmail);

// 🌸 ADMIN CONTACT ROUTES MADE PUBLIC FOR DEVELOPMENT 🌸
router.post('/batch', sendBatchEmails);
router.get('/list', listEmails); 
router.get('/:id', retrieveEmail);
router.put('/:id', updateEmail);
router.delete('/:id', cancelEmail);
router.get('/:emailId/attachments', listAttachments);
router.get('/:emailId/attachments/:id', retrieveAttachment);

module.exports = router;
