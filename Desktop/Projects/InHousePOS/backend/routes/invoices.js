const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

// Private routes (require authentication)
router.use(auth);

router.post('/:projectId', invoiceController.create);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.delete);
router.get('/:id/pdf', invoiceController.getPDF);
router.post('/:id/email', invoiceController.sendEmail);
router.post('/statement', invoiceController.generateStatement);
router.get('/statement/:projectId/pdf', invoiceController.getStatementPDF);

module.exports = router;