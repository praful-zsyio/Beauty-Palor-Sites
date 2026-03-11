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

router.post('/', sendContactEmail);
router.post('/batch', sendBatchEmails);
router.get('/list', listEmails); // Place /list above /:id to avoid conflict
router.get('/:id', retrieveEmail);
router.put('/:id', updateEmail);
router.delete('/:id', cancelEmail);
router.get('/:emailId/attachments', listAttachments);
router.get('/:emailId/attachments/:id', retrieveAttachment);

module.exports = router;
