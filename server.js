'use strict';

// read env vars from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const plaid = require('./plaid');

const APP_PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(cors());

const server = app.listen(APP_PORT, function () {
  console.log('OurWallet server listening on port ' + APP_PORT);
});

// Middleware to check for the token in the Authorization header
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

// Routes

app.get('/api/hello', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      response.json({hello: 'Welcome to the OurWallet Server!'});
    })
    .catch(next);
});

app.get('/api/plaid/create_link_token', authenticateToken, plaid.createLinkToken);
app.get('/api/plaid/exchange_token', authenticateToken, plaid.exchangeToken);

app.use('/api', function (error, request, response, next) {
  console.log(error);
  response.json(formatError(error.response));
});

const formatError = (error) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};