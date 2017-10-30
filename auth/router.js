'use strict';

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    // algorithm: 'HS256'
  });
};

const basicAuth = passport.authenticate('basic', { session: false, failWithError: true  });
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/login', basicAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());

  logTokenDate(authToken);
  
  res.json({ authToken });
});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = { router };


function logTokenDate(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  var d = new Date(0);
  d.setUTCSeconds(decoded.exp); 
  console.log(d.toLocaleString());
}