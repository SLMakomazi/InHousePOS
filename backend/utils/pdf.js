const pdf = require('pdfkit');
const fs = require('fs/promises');
const path = require('path');
const config = require('../config/config');

class PDFService {
  static async generateContract(contract) {
    const doc = new pdf();

    // Add header
    doc.fontSize(25).text('Contract', { align: 'center' });
    doc.moveDown();

    // Add contract details
    doc.fontSize(12)
      .text(`Contract Number: ${contract.contractNumber}`)
      .text(`Project: ${contract.projectName}`)
      .text(`Client: ${contract.clientName}`)
      .text(`Date: ${new Date(contract.createdAt).toLocaleDateString()}`)
      .moveDown();

    // Add terms and conditions
    doc.fontSize(12).text('Terms and Conditions:');
    doc.moveDown();
    doc.fontSize(10).text(contract.termsAndConditions);

    // Add signature section
    doc.moveDown();
    doc.fontSize(12).text('Client Signature:');
    doc.moveDown();
    doc.fontSize(12).text('Company Signature:');
    doc.moveDown();

    // Generate PDF buffer
    const buffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    return buffer;
  }

  static async generateInvoice(invoice) {
    const doc = new pdf();

    // Add header
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Add invoice details
    doc.fontSize(12)
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .text(`Project: ${invoice.projectName}`)
      .text(`Client: ${invoice.clientName}`)
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
      .moveDown();

    // Add items table
    doc.fontSize(12).text('Items:');
    doc.moveDown();
    invoice.items.forEach(item => {
      doc.fontSize(10)
        .text(`${item.description} - ${item.quantity} x ${item.price} = ${item.quantity * item.price}`);
    });
    doc.moveDown();

    // Add total
    doc.fontSize(12).text(`Total Amount: ${invoice.totalAmount}`);
    doc.moveDown();

    // Add payment terms
    doc.fontSize(12).text('Payment Terms:');
    doc.moveDown();
    doc.fontSize(10).text(invoice.paymentTerms);

    // Generate PDF buffer
    const buffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    return buffer;
  }

  static async generateStatement(data) {
    const doc = new pdf();

    // Add header
    doc.fontSize(25).text('Financial Statement', { align: 'center' });
    doc.moveDown();

    // Add project details
    doc.fontSize(12)
      .text(`Project: ${data.project.name}`)
      .text(`Period: ${data.startDate} to ${data.endDate}`)
      .moveDown();

    // Add invoices summary
    doc.fontSize(12).text('Invoices Summary:');
    doc.moveDown();
    data.invoices.forEach(invoice => {
      doc.fontSize(10)
        .text(`Invoice #${invoice.invoiceNumber} - ${invoice.totalAmount} - ${invoice.status}`);
    });
    doc.moveDown();

    // Add totals
    doc.fontSize(12).text('Totals:');
    doc.moveDown();
    doc.fontSize(10)
      .text(`Total Revenue: ${data.totalRevenue}`)
      .text(`Number of Contracts: ${data.contractCount}`)
      .text(`Number of Invoices: ${data.invoiceCount}`);

    // Generate PDF buffer
    const buffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    return buffer;
  }

  static async generateProjectSummary(project) {
    const doc = new pdf();

    // Add header
    doc.fontSize(25).text('Project Summary', { align: 'center' });
    doc.moveDown();

    // Add project details
    doc.fontSize(12)
      .text(`Project Name: ${project.name}`)
      .text(`Client: ${project.clientName}`)
      .text(`Start Date: ${new Date(project.startDate).toLocaleDateString()}`)
      .text(`End Date: ${new Date(project.endDate).toLocaleDateString()}`)
      .moveDown();

    // Add status
    doc.fontSize(12).text('Project Status:');
    doc.moveDown();
    doc.fontSize(10).text(project.status);
    doc.moveDown();

    // Add milestones
    if (project.milestones && project.milestones.length > 0) {
      doc.fontSize(12).text('Milestones:');
      doc.moveDown();
      project.milestones.forEach(milestone => {
        doc.fontSize(10)
          .text(`${milestone.name} - ${milestone.status} - ${new Date(milestone.dueDate).toLocaleDateString()}`);
      });
      doc.moveDown();
    }

    // Generate PDF buffer
    const buffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    return buffer;
  }
}

module.exports = PDFService;