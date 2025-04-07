'use strict';

// read env vars from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Home
app.get('/', function (req, res) {
  res.render('home');
});

// Some boring legal stuff
app.get('/password-reset', (req, res) => {
  res.render('privacy');
});

app.get('/terms', (req, res) => {
  res.render('terms');
});

// For apple Universal Links
// Serve the apple-app-site-association file
app.get('/.well-known/apple-app-site-association', function(request, response) {
  response.setHeader('content-type', 'application/json ');
  response.sendFile(__dirname +  '/.well-known/apple-app-site-association');
});

// Export the app for Vercel
module.exports = app;