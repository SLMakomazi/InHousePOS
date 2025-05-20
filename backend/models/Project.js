const pool = require('../config/db');

class Project {
  static async create(projectData) {
    const [result] = await pool.query('INSERT INTO projects SET ?', projectData);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll(userId) {
    const [rows] = await pool.query('SELECT * FROM projects WHERE userId = ?', [userId]);
    return rows;
  }

  static async update(id, projectData) {
    const [result] = await pool.query('UPDATE projects SET ? WHERE id = ?', [projectData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE projects SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  static async getContracts(id) {
    const [rows] = await pool.query('SELECT * FROM contracts WHERE projectId = ?', [id]);
    return rows;
  }

  static async getInvoices(id) {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE projectId = ?', [id]);
    return rows;
  }

  static async getFinancialSummary(id) {
    const [rows] = await pool.query(`
      SELECT 
        SUM(invoices.totalAmount) as totalRevenue,
        COUNT(DISTINCT contracts.id) as contractCount,
        COUNT(DISTINCT invoices.id) as invoiceCount
      FROM projects
      LEFT JOIN contracts ON projects.id = contracts.projectId
      LEFT JOIN invoices ON projects.id = invoices.projectId
      WHERE projects.id = ?
    `, [id]);
    return rows[0];
  }
}

module.exports = Project;