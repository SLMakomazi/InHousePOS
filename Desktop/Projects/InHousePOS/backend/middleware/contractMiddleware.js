const db = require('../config/db');

/**
 * Middleware to set user ID and client information for contract history triggers
 * This should be used on routes that modify contracts
 */
const setContractAuditInfo = (req, res, next) => {
  // Get client IP address
  const ip = req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Get user agent
  const userAgent = req.headers['user-agent'] || '';

  // Set session variables for triggers
  const setVarsQuery = `
    SET @_user_id = ?;
    SET @_client_ip = ?;
    SET @_client_user_agent = ?;
  `;

  const userId = req.user ? req.user.id : null;

  db.query(setVarsQuery, [userId, ip, userAgent], (error) => {
    if (error) {
      console.error('Error setting contract audit variables:', error);
      // Don't fail the request, just log the error
    }
    next();
  });
};

/**
 * Middleware to check if user has permission to access a contract
 * Must be used after auth middleware
 */
const checkContractAccess = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can access any contract
  if (userRole === 'admin') {
    return next();
  }

  // For non-admin users, check if they are the owner of the contract's project
  const query = `
    SELECT c.id 
    FROM contracts c
    JOIN projects p ON c.projectId = p.id
    WHERE c.id = ? AND p.userId = ?
    LIMIT 1
  `;

  db.query(query, [id, userId], (error, results) => {
    if (error) {
      console.error('Error checking contract access:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this contract' 
      });
    }

    next();
  });
};

/**
 * Middleware to validate contract data
 */
const validateContractData = (req, res, next) => {
  const { 
    contractNumber, 
    title, 
    startDate, 
    endDate,
    amount,
    items
  } = req.body;

  const errors = [];

  // Required fields
  if (!contractNumber) errors.push('Contract number is required');
  if (!title) errors.push('Title is required');
  if (!startDate) errors.push('Start date is required');
  
  // Date validation
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('End date must be after start date');
  }

  // Amount validation
  if (amount && isNaN(parseFloat(amount))) {
    errors.push('Amount must be a valid number');
  }

  // Items validation
  if (items && Array.isArray(items)) {
    items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (item.quantity && isNaN(parseFloat(item.quantity))) {
        errors.push(`Item ${index + 1}: Quantity must be a valid number`);
      }
      if (item.unitPrice && isNaN(parseFloat(item.unitPrice))) {
        errors.push(`Item ${index + 1}: Unit price must be a valid number`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

module.exports = {
  setContractAuditInfo,
  checkContractAccess,
  validateContractData
};
