const pool = require('../config/db');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const [result] = await pool.query('INSERT INTO users SET ?', userData);
    return result.insertId;
  }

  static async update(id, userData) {
    const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [userData, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  }
}

module.exports = User;