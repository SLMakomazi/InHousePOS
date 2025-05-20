const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const authController = {
  async login(req, res) {
    const { username, password } = req.body;
    console.log('--- Login Attempt ---');
    console.log('Received username:', username);
    console.log('Received password (length):', password ? password.length : 'undefined/empty');

    try {
      const user = await User.findByUsername(username);
      console.log('User found in DB:', user ? { id: user.id, username: user.username, hasPassword: !!user.password } : null);

      if (!user) {
        console.log('User not found in DB, sending 401.');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.password) {
        console.log('User found but has no password in DB (user.password is falsy), sending 401.');
        return res.status(401).json({ message: 'Invalid credentials - user data issue' });
      }
      
      console.log('Comparing received password with stored hash for user:', user.username);
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password comparison result (isValidPassword):', isValidPassword);

      if (!isValidPassword) {
        console.log('Password comparison failed, sending 401.');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('Login successful, generating token for user ID:', user.id);
      const token = jwt.sign(
        { userId: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error during login execution:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  async register(req, res) {
    try {
      const { username, password, email, role } = req.body;
      
      // Check if user exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        username,
        password: hashedPassword,
        email,
        role: role || 'user'
      };

      const userId = await User.create(userData);
      res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = authController;