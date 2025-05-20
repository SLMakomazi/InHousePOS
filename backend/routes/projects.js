const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Private routes (require authentication)
router.use(auth);

router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);
router.post('/:id/contract', projectController.generateContract);
router.post('/:id/invoice', projectController.generateInvoice);

module.exports = router;