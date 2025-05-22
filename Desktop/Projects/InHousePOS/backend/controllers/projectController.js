const Project = require('../models/Project');
const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');

const projectController = {
  async create(req, res) {
    try {
      const project = await Project.create({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  },

  async getAll(req, res) {
    try {
      const projects = await Project.findAll(req.userId);
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  },

  async getById(req, res) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Project.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json({ message: 'Project updated successfully' });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  },

  async delete(req, res) {
    try {
      // First delete related contracts and invoices
      await Contract.deleteByProject(req.params.id);
      await Invoice.deleteByProject(req.params.id);

      // Then delete the project
      const deleted = await Project.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  },

  async generateContract(req, res) {
    try {
      const { projectId } = req.params;
      const contractData = req.body;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Create contract
      const contract = await Contract.create({
        ...contractData,
        projectId,
        userId: req.userId
      });

      // Generate PDF
      const pdf = await require('../utils/pdf').generateContract(contract);
      
      res.json({
        contract,
        pdfUrl: `/api/contracts/${contract.id}/pdf`
      });
    } catch (error) {
      console.error('Generate contract error:', error);
      res.status(500).json({ message: 'Failed to generate contract' });
    }
  },

  async generateInvoice(req, res) {
    try {
      const { projectId } = req.params;
      const invoiceData = req.body;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Create invoice
      const invoice = await Invoice.create({
        ...invoiceData,
        projectId,
        userId: req.userId
      });

      // Generate PDF
      const pdf = await require('../utils/pdf').generateInvoice(invoice);
      
      res.json({
        invoice,
        pdfUrl: `/api/invoices/${invoice.id}/pdf`
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      res.status(500).json({ message: 'Failed to generate invoice' });
    }
  }
};

module.exports = projectController;