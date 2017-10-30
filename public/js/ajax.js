/* global $ */
'use strict';
/**
 * API: DATA ACCESS LAYER (using fetch())
 * 
 * Primary Job: communicates with API methods. 
 *  
 * Rule of Thumb:
 * - Never manipulation DOM directly
 * - No jquery on this page, use `fetch()` not `$.AJAX()` or `$.getJSON()`
 * - Do not call render methods from this layer
 * 
 */

const ITEMS_URL = '/api/things/';
const USERS_URL = '/api/users/';
const LOGIN_URL = '/api/auth/login/';
const REFRESH_URL = '/api/auth/refresh/';

var api = {
  signup: function (username, password) {
    const body = {
      username: username,
      password: password
    };

    return $.ajax({
      type: 'POST',
      url: USERS_URL,
      data: JSON.stringify(body),
      dataType: 'json',
      contentType: 'application/json',
    }).catch( err => {
      console.log(err);
    });

  },
  login: function (username, password) {
    const base64Encoded = window.btoa(`${username}:${password}`);
    return $.ajax({
      type: 'POST',
      url: LOGIN_URL,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Basic ${base64Encoded}`);
      }
    });

  },
  refresh: function (token) {
    return $.ajax({
      type: 'POST',
      url: REFRESH_URL,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    });
  },
  search: function (query) {
    return $.ajax({
      type: 'GET',
      url: ITEMS_URL,
      data: query,
    });
  },
  details: function (id) {
    return $.ajax({
      type: 'GET',
      url: `${ITEMS_URL}${id}`
    });
  },
  create: function (document, token) {
    return $.ajax({
      type: 'POST',
      url: ITEMS_URL,
      data: document ? JSON.stringify(document) : null,
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    });
  },
  update: function (document, token) {
    return $.ajax({
      type: 'PUT',
      url: `${ITEMS_URL}${document.id}`,
      data: document ? JSON.stringify(document) : null,
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    }).catch( err => {
      return err;
    });

  },
  remove: function (id, token) {
    return $.ajax({
      type: 'DELETE',
      url: `${ITEMS_URL}${id}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    });

  }
};


