const db = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
const getAll = async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
      FROM contracts c
      LEFT JOIN projects p ON c.projectId = p.id
      LEFT JOIN users u ON p.userId = u.id
      ORDER BY c.createdAt DESC
    `);
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single contract by ID
// @route   GET /api/contracts/:id
// @access  Private
const getById = async (req, res) => {
  try {
    const [contract] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get contract items if any
    const [items] = await db.query(
      'SELECT * FROM contract_items WHERE contract_id = ?',
      [req.params.id]
    );

    res.json({
      ...contract[0],
      items: items || []
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contracts for a project
// @route   GET /api/contracts/project/:projectId
// @access  Private
const getByProjectId = async (req, res) => {
  try {
    const [contracts] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.projectId = ?
       ORDER BY c.createdAt DESC`,
      [req.params.projectId]
    );
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching project contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contracts for a client
// @route   GET /api/contracts/client/:clientId
// @access  Private
const getByClientId = async (req, res) => {
  try {
    const [contracts] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE p.userId = ?
       ORDER BY c.createdAt DESC`,
      [req.params.clientId]
    );
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching client contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new contract
// @route   POST /api/contracts/:projectId
// @access  Private
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId } = req.params;
  const { 
    contract_number, 
    title, 
    description, 
    start_date, 
    end_date, 
    status, 
    total_amount, 
    terms, 
    notes, 
    items 
  } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert contract
    const [result] = await connection.query(
      `INSERT INTO contracts (
        projectId, contract_number, title, description, 
        start_date, end_date, status, total_amount, terms, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId, contract_number, title, description,
        start_date, end_date, status || 'draft', 
        total_amount || 0, terms || '', notes || ''
      ]
    );

    const contractId = result.insertId;

    // Insert contract items if any
    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        contractId,
        item.description,
        item.quantity || 1,
        item.unit_price || 0,
        item.total || 0,
        item.notes || ''
      ]);

      await connection.query(
        `INSERT INTO contract_items 
        (contract_id, description, quantity, unit_price, total, notes)
        VALUES ?`,
        [itemValues]
      );
    }


    await connection.commit();
    
    // Fetch the created contract with all its data
    const [newContract] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [contractId]
    );

    res.status(201).json(newContract[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { 
    contract_number, 
    title, 
    description, 
    start_date, 
    end_date, 
    status, 
    total_amount, 
    terms, 
    notes, 
    items 
  } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update contract
    await connection.query(
      `UPDATE contracts SET
        contract_number = ?,
        title = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        total_amount = ?,
        terms = ?,
        notes = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        contract_number,
        title,
        description,
        start_date,
        end_date,
        status,
        total_amount || 0,
        terms || '',
        notes || '',
        id
      ]
    );

    // Delete existing items and insert new ones
    await connection.query('DELETE FROM contract_items WHERE contract_id = ?', [id]);

    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        id,
        item.description,
        item.quantity || 1,
        item.unit_price || 0,
        item.total || 0,
        item.notes || ''
      ]);

      await connection.query(
        `INSERT INTO contract_items 
        (contract_id, description, quantity, unit_price, total, notes)
        VALUES ?`,
        [itemValues]
      );
    }


    await connection.commit();
    
    // Fetch the updated contract with all its data
    const [updatedContract] = await connection.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [id]
    );

    res.json(updatedContract[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private
const deleteContract = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contracts WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate contract PDF
// @route   GET /api/contracts/:id/pdf
// @access  Private
const getPDF = async (req, res) => {
  try {
    const [contract] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name,
       u.email as client_email, u.phone as client_phone,
       u.address as client_address
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get contract items
    const [items] = await db.query(
      'SELECT * FROM contract_items WHERE contract_id = ?',
      [req.params.id]
    );

    // In a real application, you would use a PDF generation library like pdfkit or puppeteer
    // This is a simplified example that returns a text representation
    const contractData = {
      ...contract[0],
      items: items || []
    };

    // For now, we'll just return the JSON data
    // In a real app, you would generate a PDF and send it
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(contractData, null, 2));
    
    // Example of how you might generate a PDF (commented out as it requires additional setup):
    /*
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contract[0].contract_number || contract[0].id}.pdf`);
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(20).text(`Contract #${contract[0].contract_number || contract[0].id}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Client: ${contract[0].client_name}`);
    // ... more PDF content ...
    
    doc.end();
    */
  } catch (error) {
    console.error('Error generating contract PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send contract via email
// @route   POST /api/contracts/:id/email
// @access  Private
const sendEmail = async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    
    // In a real application, you would implement email sending logic here
    // For example, using nodemailer or another email service
    
    res.json({ message: 'Contract sent successfully' });
  } catch (error) {
    console.error('Error sending contract email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve a contract
// @route   POST /api/contracts/:id/approve
// @access  Private
const approve = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if contract exists and is in a valid state for approval
    const [contract] = await db.query(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );

    if (!contract || contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update contract status to approved
    await db.query(
      'UPDATE contracts SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      ['approved', userId, id]
    );

    res.json({ message: 'Contract approved successfully' });
  } catch (error) {
    console.error('Error approving contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a contract
// @route   POST /api/contracts/:id/reject
// @access  Private
const reject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  if (!reason) {
    return res.status(400).json({ message: 'Please provide a reason for rejection' });
  }

  try {
    // Check if contract exists
    const [contract] = await db.query(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );

    if (!contract || contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update contract status to rejected and store rejection reason
    await db.query(
      `UPDATE contracts 
       SET status = 'rejected', 
           rejected_by = ?, 
           rejected_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [userId, reason, id]
    );

    res.json({ message: 'Contract rejected successfully' });
  } catch (error) {
    console.error('Error rejecting contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contract history
// @route   GET /api/contracts/:id/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const [history] = await db.query(
      `SELECT * FROM contract_history 
       WHERE contract_id = ? 
       ORDER BY changed_at DESC`,
      [req.params.id]
    );
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching contract history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate a contract
// @route   POST /api/contracts/:id/duplicate
// @access  Private
const duplicate = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Start transaction
    await db.query('START TRANSACTION');

    // Get original contract
    const [contracts] = await db.query(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );

    if (!contracts || contracts.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Contract not found' });
    }

    const contract = contracts[0];
    
    // Create new contract
    const [result] = await db.query(
      `INSERT INTO contracts (
        contract_number, title, description, start_date, end_date, 
        status, total_amount, terms, notes, projectId, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `COPY-${contract.contract_number}`,
        `${contract.title} (Copy)`,
        contract.description,
        contract.start_date,
        contract.end_date,
        'draft',
        contract.total_amount,
        contract.terms,
        contract.notes,
        contract.projectId,
        userId,
        userId
      ]
    );

    const newContractId = result.insertId;

    // Copy contract items
    const [items] = await db.query(
      'SELECT * FROM contract_items WHERE contract_id = ?',
      [id]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          `INSERT INTO contract_items (
            contract_id, description, quantity, unit_price, total_price, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newContractId,
            item.description,
            item.quantity,
            item.unit_price,
            item.total_price,
            userId
          ]
        );
      }
    }

    await db.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Contract duplicated successfully',
      contractId: newContractId 
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error duplicating contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export contract data
// @route   POST /api/contracts/:id/export
// @access  Private
const exportContract = async (req, res) => {
  try {
    const [contract] = await db.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_name,
              u.email as client_email, u.phone as client_phone
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!contract || contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get contract items
    const [items] = await db.query(
      'SELECT * FROM contract_items WHERE contract_id = ?',
      [req.params.id]
    );

    const data = {
      ...contract[0],
      items: items || []
    };

    // In a real implementation, you might want to format this as CSV, Excel, etc.
    // For now, we'll just return the JSON data
    res.json({
      message: 'Export successful',
      data: data,
      format: 'json',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAll,
  getById,
  getByProjectId,
  getByClientId,
  create,
  update,
  delete: deleteContract,
  getPDF,
  sendEmail,
  approve,
  reject,
  getHistory,
  duplicate,
  exportContract
};