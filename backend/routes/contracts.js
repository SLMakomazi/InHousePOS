const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');

// Private routes (require authentication)
router.use(auth);

router.post('/:projectId', contractController.create);
router.get('/', contractController.getAll);
router.get('/:id', contractController.getById);
router.put('/:id', contractController.update);
router.delete('/:id', contractController.delete);
router.get('/:id/pdf', contractController.getPDF);
router.post('/:id/email', contractController.sendEmail);

module.exports = router;