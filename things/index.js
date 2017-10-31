'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });


router.get('/', (req, res) => {
  
});

router.get('/:id', (req, res) => {
 
});

router.post('/', jwtAuth, jsonParser, (req, res) => {
  
});

router.put('/:id', jwtAuth, jsonParser, (req, res) => {
 
});

router.delete('/:id', jwtAuth, (req, res) => {

});

module.exports = { router };