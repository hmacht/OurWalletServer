const express = require('express');
const router = express.Router();
const plaid = require('../plaid');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }

  next();
}

router.get('/v1/plaid/create_link_token', authenticateToken, plaid.createLinkToken);
router.get('/v1/plaid/exchange_token', authenticateToken, plaid.exchangeToken);
router.get('/v1/plaid/transactions', authenticateToken, plaid.getTransactions);

router.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ api_error: error.message || 'Internal Server Error' });
});

module.exports = router;
