'use strict';
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();
const createAuthToken = function(email) {
  return jwt.sign({ email }, config.JWT_SECRET, {
    subject: email.email,
    expiresIn: config.JWT_EXPIRY,
    // algorithm: 'HS256'
  });
};
const basicAuth = passport.authenticate('basic', { session: false, failWithError: true  });
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });
router.post('/login', basicAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());
  const user = req.user.apiRepr();
  const userId = user.id;
  logTokenDate(authToken);
  res.json({ authToken, id: userId });
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