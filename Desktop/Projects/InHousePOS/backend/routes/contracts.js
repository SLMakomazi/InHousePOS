const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');
const { 
  setContractAuditInfo, 
  checkContractAccess, 
  validateContractData 
} = require('../middleware/contractMiddleware');
const { check } = require('express-validator');

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/contracts
// @desc    Get all contracts
// @access  Private
router.get('/', contractController.getAll);

// @route   GET /api/contracts/project/:projectId
// @desc    Get all contracts for a project
// @access  Private
router.get('/project/:projectId', contractController.getByProjectId);

// @route   GET /api/contracts/client/:clientId
// @desc    Get all contracts for a client
// @access  Private
router.get('/client/:clientId', contractController.getByClientId);

// @route   GET /api/contracts/:id
// @desc    Get a single contract by ID
// @access  Private
router.get('/:id', checkContractAccess, contractController.getById);

// @route   POST /api/contracts/:projectId
// @desc    Create a new contract
// @access  Private
router.post(
  '/:projectId',
  auth, 
  setContractAuditInfo, 
  [
    check('contractNumber', 'Contract number is required').not().isEmpty(),
    check('title', 'Title is required').optional(),
    check('startDate', 'Start date is required').optional().isISO8601(),
    check('endDate', 'End date must be a valid date').optional().isISO8601(),
    check('totalCost', 'Total cost must be a valid number').optional().isNumeric(),
    validateContractData
  ],
  contractController.create
);

// @route   PUT /api/contracts/:id
// @desc    Update a contract
// @access  Private
router.put(
  '/:id',
  setContractAuditInfo,
  [
    check('contractNumber', 'Contract number is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date must be a valid date').optional({ checkFalsy: true }).isISO8601(),
    validateContractData,
    checkContractAccess
  ],
  contractController.update
);

// @route   DELETE /api/contracts/:id
// @desc    Delete a contract
// @access  Private
router.delete(
  '/:id',
  setContractAuditInfo,
  checkContractAccess,
  contractController.delete
);

// @route   GET /api/contracts/:id/pdf
// @desc    Generate contract PDF
// @access  Private
router.get(
  '/:id/pdf',
  checkContractAccess,
  contractController.getPDF
);

// @route   POST /api/contracts/:id/email
// @desc    Send contract via email
// @access  Private
router.post(
  '/:id/email',
  [
    check('recipientEmail', 'Please include a valid email').isEmail(),
    checkContractAccess
  ],
  contractController.sendEmail
);

// @route   POST /api/contracts/:id/approve
// @desc    Approve a contract
// @access  Private
router.post(
  '/:id/approve',
  setContractAuditInfo,
  checkContractAccess,
  contractController.approve
);

// @route   POST /api/contracts/:id/reject
// @desc    Reject a contract
// @access  Private
router.post(
  '/:id/reject',
  setContractAuditInfo,
  [
    check('reason', 'Please provide a reason for rejection').not().isEmpty(),
    checkContractAccess
  ],
  contractController.reject
);

// @route   GET /api/contracts/:id/history
// @desc    Get contract history
// @access  Private
router.get(
  '/:id/history',
  checkContractAccess,
  contractController.getHistory
);

// @route   POST /api/contracts/:id/duplicate
// @desc    Duplicate a contract
// @access  Private
router.post(
  '/:id/duplicate',
  checkContractAccess,
  contractController.duplicate
);

// @route   POST /api/contracts/:id/export
// @desc    Export contract data
// @access  Private
router.post(
  '/:id/export',
  checkContractAccess,
  contractController.exportContract
);

module.exports = router;