const Contract = require('../models/Contract');
const Project = require('../models/Project');
const email = require('../utils/email');
const pdf = require('../utils/pdf');

const contractController = {
  async create(req, res) {
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
        userId: req.userId,
        status: 'draft'
      });

      // Generate PDF
      const pdfBuffer = await pdf.generateContract(contract);
      
      // Save PDF path
      const pdfPath = await Contract.savePDF(contract.id, pdfBuffer);

      res.json({
        contract,
        pdfUrl: `/api/contracts/${contract.id}/pdf`
      });
    } catch (error) {
      console.error('Create contract error:', error);
      res.status(500).json({ message: 'Failed to create contract' });
    }
  },

  async getAll(req, res) {
    try {
      const contracts = await Contract.findAll(req.userId);
      res.json(contracts);
    } catch (error) {
      console.error('Get contracts error:', error);
      res.status(500).json({ message: 'Failed to fetch contracts' });
    }
  },

  async getById(req, res) {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // Get related project data
      const project = await Project.findById(contract.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({
        contract,
        project
      });
    } catch (error) {
      console.error('Get contract error:', error);
      res.status(500).json({ message: 'Failed to fetch contract' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Contract.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // If status changed to 'approved', send email notification
      if (req.body.status === 'approved') {
        const contract = await Contract.findById(req.params.id);
        await email.sendContractApprovalNotification(contract);
      }

      res.json({ message: 'Contract updated successfully' });
    } catch (error) {
      console.error('Update contract error:', error);
      res.status(500).json({ message: 'Failed to update contract' });
    }
  },

  async delete(req, res) {
    try {
      // Delete related PDF file
      await Contract.deletePDF(req.params.id);
      
      // Delete contract record
      const deleted = await Contract.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      res.json({ message: 'Contract deleted successfully' });
    } catch (error) {
      console.error('Delete contract error:', error);
      res.status(500).json({ message: 'Failed to delete contract' });
    }
  },

  async getPDF(req, res) {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      const pdfPath = await Contract.getPDFPath(contract.id);
      if (!pdfPath) {
        return res.status(404).json({ message: 'Contract PDF not found' });
      }

      res.download(pdfPath, `contract_${contract.id}.pdf`);
    } catch (error) {
      console.error('Get contract PDF error:', error);
      res.status(500).json({ message: 'Failed to fetch contract PDF' });
    }
  },

  async sendEmail(req, res) {
    try {
      const { contractId, recipientEmail } = req.body;
      
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Generate PDF if not exists
      let pdfPath = await Contract.getPDFPath(contract.id);
      if (!pdfPath) {
        const pdfBuffer = await pdf.generateContract(contract);
        pdfPath = await Contract.savePDF(contract.id, pdfBuffer);
      }

      // Send email with PDF attachment
      await email.sendContract(contract, recipientEmail, pdfPath);
      
      res.json({ message: 'Contract email sent successfully' });
    } catch (error) {
      console.error('Send contract email error:', error);
      res.status(500).json({ message: 'Failed to send contract email' });
    }
  }
};

module.exports = contractController;