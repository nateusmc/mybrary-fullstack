'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

const items = require('../db/storage')('items');

// Seed the dummy database
items.addOne({ name: 'aaa' });
items.addOne({ name: 'bbb' });
items.addOne({ name: 'ccc' });
items.addOne({ name: 'ddd' });
items.addOne({ name: 'eee' });
items.addOne({ name: 'fff' });


router.get('/', (req, res) => {
  const query = req.query;
  // Remember, *never* trust users, *always* validate data
  const list = items.getList(query);
  return res.json(list);
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  return res.json(items.getOne(id));
});

router.post('/', jwtAuth, jsonParser, (req, res) => {
  // Remember, *never* trust users, *always* validate data
  const thing = req.body;
  return res.status(201).json(items.addOne(thing));
});

router.put('/:id', jwtAuth, jsonParser, (req, res) => {
  // Remember, *never* trust users, *always* validate data
  const body = req.body;
  return res.json(items.modOne(body));
});

router.delete('/:id', jwtAuth, (req, res) => {
  const id = req.params.id;
  items.delOne(id);
  return res.sendStatus(204);
});

module.exports = { router };