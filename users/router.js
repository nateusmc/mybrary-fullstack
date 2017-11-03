'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models');
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user.apiRepr()));
}),
router.post('/', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'email', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }
  const stringFields = ['firstName', 'lastName', 'email', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
  const explicityTrimmedFields = ['firstName', 'lastName', 'email', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }
  const sizedFields = {
    email: { min: 1 },
    password: { min: 10, max: 72 }
  };
  const tooSmallField = Object.keys(sizedFields).find(field =>
    'min' in sizedFields[field] &&
    req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(field =>
    'max' in sizedFields[field] &&
    req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  let { firstName, lastName, email, password } = req.body;
  return User.find({ email })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Email already taken',
          location: 'email'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({ firstName, lastName, email, password: hash });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});
router.put('/:id', (req, res) => {
  User.findByIdAndUpdate(req.params.id, {$push:{bookIds: req.body.bookId}},
    function(err) {
      if(err){
        console.log(err);
      }
      else {
        res.send('everything seems to be working');
      }
    });
});
router.delete('/:id', (req, res) => {
  console.log(req.body);
  User.update({'_id':req.params.id}, {$pull:{bookIds: req.body.bookId}},
    function(err) {
      if(err){
        console.log(err);
      }
      else {
        res.send('everything seems to be working');
      }
    });
});
module.exports = { router };