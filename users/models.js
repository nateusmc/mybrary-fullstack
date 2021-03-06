'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    unique: true
  },
  lastName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bookIds: {
    type: Array,
    required: false,
    unique: false
  }
});
UserSchema.methods.apiRepr = function () {
  return {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    id: this._id,
    bookIds: this.bookIds
  };
};
UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};
const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = { User };