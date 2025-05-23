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
    // First, get basic contract info
    const [contract] = await db.query(
      `SELECT * FROM contracts WHERE id = ?`,
      [req.params.id]
    );

    if (contract.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get project details if projectId exists
    let project = null;
    if (contract[0].projectId) {
      const [projectData] = await db.query(
        'SELECT * FROM projects WHERE id = ?',
        [contract[0].projectId]
      );
      project = projectData[0];
    }

    // Get client details if clientId exists
    let client = null;
    if (contract[0].clientId) {
      const [clientData] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [contract[0].clientId]
      );
      client = clientData[0];
    }

    // Format the response
    const response = {
      id: contract[0].id,
      contractNumber: contract[0].contractNumber || `CONTRACT-${String(contract[0].id).padStart(6, '0')}`,
      title: contract[0].title || contract[0].projectName || 'Contract',
      description: contract[0].description || contract[0].projectDescription || '',
      effectiveDate: contract[0].effectiveDate || contract[0].createdAt,
      startDate: contract[0].startDate || contract[0].effectiveDate || contract[0].createdAt,
      endDate: contract[0].endDate,
      status: contract[0].status || 'draft',
      totalCost: contract[0].totalCost || contract[0].totalAmount || 0,
      clientName: contract[0].clientName || (client ? `${client.firstName} ${client.lastName}` : 'N/A'),
      clientEmail: contract[0].clientEmail || (client ? client.email : ''),
      clientPhone: contract[0].clientPhone || contract[0].clientContact || (client ? client.phone : ''),
      clientAddress: contract[0].clientAddress || (client ? client.address : ''),
      paymentSchedule: contract[0].paymentSchedule 
        ? (typeof contract[0].paymentSchedule === 'string' 
            ? JSON.parse(contract[0].paymentSchedule) 
            : contract[0].paymentSchedule)
        : {
            upfront: { percentage: 0, amount: 0 },
            installments: { count: 0, amount: 0 }
          },
      additionalTerms: contract[0].additionalTerms || contract[0].termsAndConditions || '',
      createdAt: contract[0].createdAt,
      updatedAt: contract[0].updatedAt,
      project: project ? {
        id: project.id,
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId } = req.params;
  const userId = req.user?.id; // Use optional chaining in case req.user is undefined
  
  console.log('Creating contract for project:', projectId, 'by user:', userId);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const {
    contractNumber,
    title,
    description,
    effectiveDate,
    startDate = effectiveDate, // Fallback to effectiveDate if startDate is not provided
    endDate,
    status = 'draft',
    totalCost,
    clientName,
    clientEmail,
    clientContact,
    clientAddress,
    paymentSchedule,
    additionalTerms = ''
  } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Log the table structure for debugging
    const [tableInfo] = await connection.query('DESCRIBE contracts');
    console.log('Contracts table structure:', tableInfo);

    // Get project details
    const [project] = await connection.query(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project || !project.length) {
      console.error('Project not found with ID:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('Found project:', project[0].name);

    // Log the data we're trying to insert
    const contractData = {
      projectId,
      userId,
      contractNumber,
      projectName: title || `Contract for ${project[0].name}`,
      clientName: clientName || project[0].clientName || '',
      clientEmail: clientEmail || project[0].clientEmail || '',
      termsAndConditions: additionalTerms,
      status,
      amount: totalCost || project[0].budget || 0,
      paymentSchedule: paymentSchedule ? JSON.stringify(paymentSchedule) : '{}'
    };
    console.log('Contract data to insert:', contractData);

    // Insert contract using dynamic column names based on the table structure
    const columns = [
      'projectId', 'userId', 'contractNumber', 'projectName',
      'clientName', 'clientEmail', 'termsAndConditions', 'status',
      'amount', 'paymentSchedule'
    ].join(', ');
    
    const placeholders = columns.split(', ').map(() => '?').join(', ');
    
    const [result] = await connection.query(
      `INSERT INTO contracts (${columns}, createdAt, updatedAt) 
       VALUES (${placeholders}, NOW(), NOW())`,
      [
        contractData.projectId,
        contractData.userId,
        contractData.contractNumber,
        contractData.projectName,
        contractData.clientName,
        contractData.clientEmail,
        contractData.termsAndConditions,
        contractData.status,
        contractData.amount,
        contractData.paymentSchedule
      ]
    );

    const contractId = result.insertId;
    console.log('Created contract with ID:', contractId);

    // No need to update projects table as the relationship is maintained by projectId in contracts
    
    await connection.commit();
    
    // Fetch the created contract with all its data
    const [newContract] = await connection.query(
      `SELECT c.*, p.name as project_name, CONCAT(u.firstName, ' ', u.lastName) as client_contact 
       FROM contracts c
       LEFT JOIN projects p ON c.projectId = p.id
       LEFT JOIN users u ON p.userId = u.id
       WHERE c.id = ?`,
      [contractId]
    );

    if (!newContract || newContract.length === 0) {
      throw new Error('Failed to fetch created contract');
    }

    console.log('Successfully created contract:', newContract[0]);
    res.status(201).json(newContract[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating contract:', error);
    res.status(500).json({ 
      message: 'Failed to create contract',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { 
    contractNumber,
    title,
    description,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    effectiveDate,
    startDate = effectiveDate,
    endDate,
    status = 'draft',
    totalCost,
    paymentSchedule,
    additionalTerms = ''
  } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log('Updating contract with data:', JSON.stringify(req.body, null, 2));

    // Update contract
    await connection.query(
      `UPDATE contracts SET
        contractNumber = ?,
        projectName = ?,
        clientName = ?,
        clientEmail = ?,
        clientPhone = ?,
        clientAddress = ?,
        effectiveDate = ?,
        startDate = ?,
        endDate = ?,
        status = ?,
        totalCost = ?,
        paymentSchedule = ?,
        additionalTerms = ?,
        updatedAt = NOW()
      WHERE id = ?`,
      [
        contractNumber,
        title, // Using title as projectName
        clientName,
        clientEmail || null,
        clientPhone || null,
        clientAddress || null,
        effectiveDate,
        startDate,
        endDate || null,
        status,
        totalCost || 0,
        JSON.stringify(paymentSchedule) || null,
        additionalTerms,
        id
      ]
    );

    await connection.commit();
    
    // Fetch the updated contract with all its data
    const [updatedContract] = await connection.query(
      'SELECT * FROM contracts WHERE id = ?',
      [id]
    );

    if (!updatedContract || updatedContract.length === 0) {
      throw new Error('Failed to fetch updated contract');
    }

    res.json(updatedContract[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating contract:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    if (!req.params.id) {
      return res.status(400).json({ message: 'Contract ID is required' });
    }

    console.log(`Generating PDF for contract ID: ${req.params.id}`);

    // Get contract data with user and project details
    const [contracts] = await db.query(`
        SELECT 
          c.*,
          p.name as projectName,
          p.description as projectDescription,
          p.clientName as projectClientName,
          p.clientEmail as projectClientEmail,
          p.clientContact as clientPhone,
          p.startDate as projectStartDate,
          p.endDate as projectEndDate,
          CONCAT(u.firstName, ' ', u.lastName) as developerName,
          u.email as developerEmail
        FROM contracts c
        LEFT JOIN projects p ON c.projectId = p.id
        LEFT JOIN users u ON p.userId = u.id
        WHERE c.id = ?
      `, [req.params.id]);

      if (!contracts || contracts.length === 0) {
        console.log('Contract not found');
        return res.status(404).json({ message: 'Contract not found' });
      }

      const contractData = contracts[0];
      console.log('Contract data:', JSON.stringify(contractData, null, 2));

      // Initialize PDF document
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      try {
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract-${contractData.contractNumber}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add header
        doc.fontSize(20).text('DEVELOPMENT SERVICES AGREEMENT', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`Contract #${contractData.contractNumber}`, { align: 'center' });
        doc.moveDown(2);

        // Contract introduction - FIXED VERSION
        doc.fontSize(12).text(
          `This Contract Agreement ("Agreement") is entered into on ${new Date(contractData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ` +
          '("Effective Date") by and between Calvin Tech Solutions ("Developer") and ' +
          `${contractData.clientName} ("Client") ` +
          `for the development and deployment of the ${contractData.projectName} ("Project").`,
          { align: 'left', lineGap: 8 }
        );
        doc.moveDown(2);

        // 1. Scope of Work
        doc.fontSize(14).text('1. Scope of Work', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(
          `The Developer agrees to design, develop, and deploy the Project, including ${contractData.projectName} ` +
          `with ${contractData.projectDescription || 'all specified features'}, ` +
          `as outlined in the proposal dated ${new Date(contractData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
        );
        doc.moveDown(1);

      // 2. Payment Terms
  doc.fontSize(14).text('2. Payment Terms', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);

  try {
    // Ensure amount is a number
    const totalAmount = parseFloat(contractData.amount) || 0;
    
    // Parse payment schedule or use defaults
    const paymentSchedule = contractData.paymentSchedule 
      ? JSON.parse(contractData.paymentSchedule)
      : { 
          upfront: { percentage: 0, amount: 0 }, 
          installments: [] 
        };

    // Total Project Cost
    doc.text(`Total Project Cost: R ${totalAmount.toFixed(2)}`);
    
    // Upfront Payment
    if (paymentSchedule.upfront?.percentage > 0) {
      const upfrontAmount = paymentSchedule.upfront.amount || 
                          (totalAmount * paymentSchedule.upfront.percentage) / 100;
      doc.text(`Upfront Payment: ${paymentSchedule.upfront.percentage}% of R ${totalAmount.toFixed(2)} = R ${upfrontAmount.toFixed(2)} (due upon signing of this Agreement)`);
    }
    
    // Installments
    if (paymentSchedule.installments?.length > 0) {
      doc.moveDown(0.5);
      doc.text('Installment Payments:');
      paymentSchedule.installments.forEach((installment, index) => {
        const dueDate = installment.dueDate 
          ? new Date(installment.dueDate).toLocaleDateString()
          : 'TBD';
        const amount = parseFloat(installment.amount) || 0;
        doc.text(`  ${index + 1}. R ${amount.toFixed(2)} due on ${dueDate}`, { indent: 20 });
      });
    }

    // Calculate and show total payments
    const totalPayments = paymentSchedule.installments?.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0) + 
                        (paymentSchedule.upfront?.amount || 0);
    
    if (Math.abs(totalPayments - totalAmount) > 0.01) { // Account for floating point precision
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Total Payments: R ${totalPayments.toFixed(2)}`, { indent: 20 });
      doc.font('Helvetica');
    }

  } catch (e) {
    console.error('Error parsing payment schedule:', e);
    doc.text('Payment terms: Could not load payment schedule');
  }
  doc.moveDown(1);

      // 3. Intellectual Property
      doc.fontSize(14).text('3. Intellectual Property', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(
        'The Developer retains ownership of the intellectual property rights to the Project, including any custom code, designs, ' +
        'and other creative works. The Client is granted a non-exclusive license to use the Project for their business purposes.'
      );
      doc.moveDown(1);

      // 4. Maintenance and Support
      doc.fontSize(14).text('4. Maintenance and Support', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(
        'The Developer may offer optional maintenance and support services, including updates, upgrades, and technical support, for an additional fee.'
      );
      doc.moveDown(1);

      // 5. Termination
      doc.fontSize(14).text('5. Termination', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(
        'Either party may terminate this Agreement upon written notice to the other party. ' +
        'Upon termination, the Client shall pay the Developer for all work completed prior to termination.'
      );
      doc.moveDown(1);

      // 6. Governing Law
      doc.fontSize(14).text('6. Governing Law', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text('This Agreement shall be governed by and construed in accordance with the laws of South Africa.');
      doc.moveDown(2);

      // Signatures section
      doc.fontSize(12).text(
        'By signing below, the parties acknowledge that they have read, understand, and agree to be bound by the terms and conditions of this Agreement.'
      );
      doc.moveDown(3);

      // Client Signature
      doc.text('Client Signature', { align: 'left' });
      doc.fontSize(12).text(contractData.clientName, { align: 'left' });
      doc.text('_________________________', { align: 'left' });
      doc.text('Date: _________________', { align: 'left' });
      doc.moveDown(3);

      // Developer Signature
      doc.text('Developer Signature', { align: 'left' });
      doc.fontSize(12).text('Calvin Tech Solutions', { align: 'left' });
      doc.text('_________________________', { align: 'left' });
      doc.text('Date: _________________', { align: 'left' });

      // Finalize the PDF
      doc.end();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: 'Failed to generate PDF',
          error: pdfError.message
        });
      }
    }
  } catch (error) {
    console.error('Error in getPDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Server error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
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