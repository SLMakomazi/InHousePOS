// utils/pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { post, download } from '../services/api';

/**
 * Utility functions for generating PDF documents
 */

const PDFGenerator = {
  /**
   * Generate a PDF from HTML content
   * @param {string} html - HTML content to convert to PDF
   * @returns {Promise<Blob>} - Promise that resolves to the PDF Blob
   */
  fromHTML: async (html) => {
    try {
      const canvas = await html2canvas(document.querySelector(html));
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },

  /**
   * Generate a contract PDF
   * @param {Object} contractId - Contract ID to fetch data for
   * @returns {Promise<Blob>} - Promise that resolves to the PDF Blob
   */
  generateContract: async (contractId) => {
    try {
      const contractData = await post('/api/contracts/pdf', { contractId });
      const doc = new jsPDF();
      
      // Add contract header
      doc.setFontSize(16);
      doc.text('Contract Agreement', 105, 20, { align: 'center' });
      
      // Add contract details
      doc.setFontSize(12);
      doc.text(`Contract ID: ${contractData.contractId}`, 10, 30);
      doc.text(`Client: ${contractData.clientName}`, 10, 40);
      doc.text(`Date: ${contractData.date}`, 10, 50);
      
      // Add terms and conditions
      doc.setFontSize(11);
      doc.text('Terms and Conditions:', 10, 70);
      
      // Add signature lines
      doc.setFontSize(11);
      doc.text('Client Signature:', 10, 200);
      doc.text('Date:', 100, 200);
      
      return doc.output('blob');
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      throw error;
    }
  },

  /**
   * Generate an invoice PDF
   * @param {Object} invoiceId - Invoice ID to fetch data for
   * @returns {Promise<Blob>} - Promise that resolves to the PDF Blob
   */
  generateInvoice: async (invoiceId) => {
    try {
      const invoiceData = await post('/api/invoices/pdf', { invoiceId });
      const doc = new jsPDF();
      
      // Add invoice header
      doc.setFontSize(16);
      doc.text('Invoice', 105, 20, { align: 'center' });
      
      // Add invoice details
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 10, 30);
      doc.text(`Date: ${invoiceData.date}`, 10, 40);
      doc.text(`Client: ${invoiceData.clientName}`, 10, 50);
      
      // Add invoice items table
      const items = invoiceData.items;
      const startX = 10;
      const startY = 70;
      
      // Table headers
      const headers = ['Description', 'Quantity', 'Unit Price', 'Total'];
      const columnWidths = [80, 30, 30, 30];
      
      headers.forEach((header, index) => {
        doc.text(header, startX + (columnWidths.slice(0, index).reduce((a, b) => a + b, 0)), startY);
      });
      
      // Table content
      items.forEach((item, rowIndex) => {
        const rowY = startY + (rowIndex + 1) * 20;
        doc.text(item.description, startX, rowY);
        doc.text(item.quantity.toString(), startX + 80, rowY);
        doc.text(item.unitPrice.toString(), startX + 110, rowY);
        doc.text(item.total.toString(), startX + 140, rowY);
      });
      
      // Add total
      doc.setFontSize(12);
      doc.text(`Total: ${invoiceData.total}`, 140, startY + (items.length + 2) * 20);
      
      return doc.output('blob');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  },

  /**
   * Download generated PDF
   * @param {Blob} pdfBlob - The PDF Blob to download
   * @param {string} filename - Name of the file to download
   */
  download: (pdfBlob, filename = 'document.pdf') => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Generate and download a PDF directly from server
   * @param {string} endpoint - API endpoint to fetch PDF data from
   * @param {Object} params - Parameters to send to the endpoint
   */
  generateFromServer: async (endpoint, params) => {
    try {
      const blob = await download(endpoint, { params });
      return blob;
    } catch (error) {
      console.error('Error generating PDF from server:', error);
      throw error;
    }
  }
};

export default PDFGenerator;