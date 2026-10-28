const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      return res.status(400).json({
        message:
          'Username must be 3-30 characters using letters, numbers, or underscores',
      });
    }

    const passwordBytes = Buffer.byteLength(password, 'utf8');

    if (password.length < 8 || passwordBytes > 72) {
      return res.status(400).json({
        message: 'Password must be between 8 and 72 characters',
      });
    }

    const existingUser = await User.findOne({
      where: { username: normalizedUsername },
    });
    if (existingUser) {
      return res.status(409).json({
        message: 'Username is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        message: 'Username is already registered',
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}


const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (
      !/^[a-z0-9_]{3,30}$/.test(normalizedUsername) ||
      password.length === 0 || 
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }
    
    const user = await User.findOne({
      where: { username: normalizedUsername },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Unable to log in',
    });
  }
};

module.exports = { register, login };