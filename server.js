'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { router: authRouter, basicStrategy, jwtStrategy } = require('./auth');
const { router: usersRouter } = require('./users');
const { router: thingsRouter } = require('./things');
const { PORT, DATABASE_URL } = require('./config');

const app = express(); 

passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use(morgan('common', { skip: () => process.env.NODE_ENV === 'test' }));
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth/', authRouter);
app.use('/api/users/', usersRouter);
app.use('/api/things/', thingsRouter);

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.removeHeader('www-authenticate');
  next(err);
});

let server;
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
