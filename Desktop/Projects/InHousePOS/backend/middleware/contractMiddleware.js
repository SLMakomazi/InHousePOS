const db = require('../config/db');

/**
 * Middleware to set user ID and client information for contract history triggers
 * This should be used on routes that modify contracts
 */
const setContractAuditInfo = async (req, res, next) => {
  try {
    // Get client IP address
    const ip = req.headers['x-forwarded-for'] || 
              req.connection.remoteAddress || 
              req.socket.remoteAddress ||
              (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Get user agent
    const userAgent = req.headers['user-agent'] || '';
    const userId = req.user ? req.user.id : null;

    // Execute each statement separately
    await db.query('SET @_user_id = ?', [userId]);
    await db.query('SET @_client_ip = ?', [ip]);
    await db.query('SET @_client_user_agent = ?', [userAgent]);
    
    next();
  } catch (error) {
    console.error('Error setting contract audit variables:', error);
    // Don't fail the request, just log the error
    next();
  }
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
    totalCost,
    paymentSchedule
  } = req.body;

  const errors = [];

  // Required fields
  if (!contractNumber) errors.push('Contract number is required');
  
  
  // Date validation
  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push('Start date must be a valid date');
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push('End date must be a valid date');
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('End date must be after start date');
  }

  // Amount validation
  if (totalCost && isNaN(parseFloat(totalCost))) {
    errors.push('Total cost must be a valid number');
  }

  // Payment schedule validation
  if (paymentSchedule) {
    try {
      const { upfront, installments } = paymentSchedule;
      
      if (upfront) {
        if (upfront.percentage && (isNaN(upfront.percentage) || upfront.percentage < 0 || upfront.percentage > 100)) {
          errors.push('Upfront percentage must be between 0 and 100');
        }
        if (upfront.amount && isNaN(parseFloat(upfront.amount))) {
          errors.push('Upfront amount must be a valid number');
        }
      }
      
      if (installments) {
        if (installments.count && (isNaN(parseInt(installments.count)) || installments.count < 0)) {
          errors.push('Number of installments must be a positive number');
        }
        if (installments.amount && isNaN(parseFloat(installments.amount))) {
          errors.push('Installment amount must be a valid number');
        }
      }
    } catch (error) {
      errors.push('Invalid payment schedule format');
    }
  }

  if (errors.length > 0) {
    console.error('Contract validation errors:', errors);
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
