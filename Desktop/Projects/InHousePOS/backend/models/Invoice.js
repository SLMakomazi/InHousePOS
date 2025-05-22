const pool = require('../config/db');
const path = require('path');
const fs = require('fs/promises');
const config = require('../config/config');

class Invoice {
  static async create(invoiceData) {
    const [result] = await pool.query('INSERT INTO invoices SET ?', invoiceData);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll(userId) {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE userId = ?', [userId]);
    return rows;
  }

  static async update(id, invoiceData) {
    const [result] = await pool.query('UPDATE invoices SET ? WHERE id = ?', [invoiceData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Delete PDF file first
    await Invoice.deletePDF(id);
    
    const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByProjectAndDate(projectId, startDate, endDate) {
    const [rows] = await pool.query(`
      SELECT * FROM invoices 
      WHERE projectId = ? 
      AND created_at BETWEEN ? AND ?
    `, [projectId, startDate, endDate]);
    return rows;
  }

  static async savePDF(invoiceId, pdfBuffer) {
    const pdfPath = path.join(config.uploads.directory, 'invoices', `${invoiceId}.pdf`);
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, pdfBuffer);
    return pdfPath;
  }

  static async getPDFPath(invoiceId) {
    const pdfPath = path.join(config.uploads.directory, 'invoices', `${invoiceId}.pdf`);
    return fs.access(pdfPath)
      .then(() => pdfPath)
      .catch(() => null);
  }

  static async deletePDF(invoiceId) {
    const pdfPath = path.join(config.uploads.directory, 'invoices', `${invoiceId}.pdf`);
    try {
      await fs.unlink(pdfPath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  static async saveStatementPDF(projectId, pdfBuffer) {
    const pdfPath = path.join(config.uploads.directory, 'statements', `${projectId}.pdf`);
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, pdfBuffer);
    return pdfPath;
  }

  static async getStatementPDFPath(projectId) {
    const pdfPath = path.join(config.uploads.directory, 'statements', `${projectId}.pdf`);
    return fs.access(pdfPath)
      .then(() => pdfPath)
      .catch(() => null);
  }

  static async deleteStatementPDF(projectId) {
    const pdfPath = path.join(config.uploads.directory, 'statements', `${projectId}.pdf`);
    try {
      await fs.unlink(pdfPath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = Invoice;