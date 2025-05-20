const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const email = require('../utils/email');
const pdf = require('../utils/pdf');

const invoiceController = {
  async create(req, res) {
    try {
      const { projectId } = req.params;
      const invoiceData = req.body;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Calculate total amount
      const total = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // Create invoice
      const invoice = await Invoice.create({
        ...invoiceData,
        projectId,
        userId: req.userId,
        totalAmount: total,
        status: 'draft'
      });

      // Generate PDF
      const pdfBuffer = await pdf.generateInvoice(invoice);
      
      // Save PDF path
      const pdfPath = await Invoice.savePDF(invoice.id, pdfBuffer);

      res.json({
        invoice,
        pdfUrl: `/api/invoices/${invoice.id}/pdf`
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({ message: 'Failed to create invoice' });
    }
  },

  async getAll(req, res) {
    try {
      const invoices = await Invoice.findAll(req.userId);
      res.json(invoices);
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  },

  async getById(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      // Get related project data
      const project = await Project.findById(invoice.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({
        invoice,
        project
      });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Invoice.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // If status changed to 'paid', update project status
      if (req.body.status === 'paid') {
        const invoice = await Invoice.findById(req.params.id);
        await Project.updateStatus(invoice.projectId, 'completed');
      }

      res.json({ message: 'Invoice updated successfully' });
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({ message: 'Failed to update invoice' });
    }
  },

  async delete(req, res) {
    try {
      // Delete related PDF file
      await Invoice.deletePDF(req.params.id);
      
      // Delete invoice record
      const deleted = await Invoice.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({ message: 'Failed to delete invoice' });
    }
  },

  async getPDF(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const pdfPath = await Invoice.getPDFPath(invoice.id);
      if (!pdfPath) {
        return res.status(404).json({ message: 'Invoice PDF not found' });
      }

      res.download(pdfPath, `invoice_${invoice.id}.pdf`);
    } catch (error) {
      console.error('Get invoice PDF error:', error);
      res.status(500).json({ message: 'Failed to fetch invoice PDF' });
    }
  },

  async sendEmail(req, res) {
    try {
      const { invoiceId, recipientEmail } = req.body;
      
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Generate PDF if not exists
      let pdfPath = await Invoice.getPDFPath(invoice.id);
      if (!pdfPath) {
        const pdfBuffer = await pdf.generateInvoice(invoice);
        pdfPath = await Invoice.savePDF(invoice.id, pdfBuffer);
      }

      // Send email with PDF attachment
      await email.sendInvoice(invoice, recipientEmail, pdfPath);
      
      res.json({ message: 'Invoice email sent successfully' });
    } catch (error) {
      console.error('Send invoice email error:', error);
      res.status(500).json({ message: 'Failed to send invoice email' });
    }
  },

  async generateStatement(req, res) {
    try {
      const { projectId, startDate, endDate } = req.body;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Get invoices within date range
      const invoices = await Invoice.findByProjectAndDate(projectId, startDate, endDate);

      // Generate statement PDF
      const pdfBuffer = await pdf.generateStatement({
        project,
        invoices,
        startDate,
        endDate
      });

      // Save PDF
      const pdfPath = await Invoice.saveStatementPDF(projectId, pdfBuffer);

      res.json({
        pdfUrl: `/api/invoices/statement/${projectId}/pdf`
      });
    } catch (error) {
      console.error('Generate statement error:', error);
      res.status(500).json({ message: 'Failed to generate statement' });
    }
  },

  async getStatementPDF(req, res) {
    try {
      const { projectId } = req.params;
      
      const pdfPath = await Invoice.getStatementPDFPath(projectId);
      if (!pdfPath) {
        return res.status(404).json({ message: 'Statement PDF not found' });
      }

      res.download(pdfPath, `statement_${projectId}.pdf`);
    } catch (error) {
      console.error('Get statement PDF error:', error);
      res.status(500).json({ message: 'Failed to fetch statement PDF' });
    }
  }
};

module.exports = invoiceController;