const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
