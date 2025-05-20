const pool = require('../config/db');
const path = require('path');
const fs = require('fs/promises');
const config = require('../config/config');

class Contract {
  static async create(contractData) {
    const [result] = await pool.query('INSERT INTO contracts SET ?', contractData);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll(userId) {
    const [rows] = await pool.query('SELECT * FROM contracts WHERE userId = ?', [userId]);
    return rows;
  }

  static async update(id, contractData) {
    const [result] = await pool.query('UPDATE contracts SET ? WHERE id = ?', [contractData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Delete PDF file first
    await Contract.deletePDF(id);
    
    const [result] = await pool.query('DELETE FROM contracts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async savePDF(contractId, pdfBuffer) {
    const pdfPath = path.join(config.uploads.directory, 'contracts', `${contractId}.pdf`);
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, pdfBuffer);
    return pdfPath;
  }

  static async getPDFPath(contractId) {
    const pdfPath = path.join(config.uploads.directory, 'contracts', `${contractId}.pdf`);
    return fs.access(pdfPath)
      .then(() => pdfPath)
      .catch(() => null);
  }

  static async deletePDF(contractId) {
    const pdfPath = path.join(config.uploads.directory, 'contracts', `${contractId}.pdf`);
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

module.exports = Contract;