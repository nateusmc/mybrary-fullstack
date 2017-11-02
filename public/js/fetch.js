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

const ITEMS_URL = '/api/users/bookIds/';
const USERS_URL = '/api/users/';
const LOGIN_URL = '/api/auth/login/';
const REFRESH_URL = '/api/auth/refresh/';
const BOOKS_API_URL = '/books/v1/volumes';
const GOOGLE_API_KEY = 'AIzaSyCLTW5L2hLYTbWfueyDRzzwt9vQead4PP0';

function buildUrl(path, query) {
  let url = new URL(path, window.location.origin);
  if (query) {
    Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  }
  return url;
}

function buildGoogleUrl(path, query) {
  let googUrl = new URL(path, 'https://www.googleapis.com');
  if (query) {
    Object.keys(query).forEach(key => 
      googUrl.searchParams.append(key, query[key]));
  }
  return googUrl;
}

function normalizeResponseErrors(res) {
  if (!res.ok) {
    if (
      res.headers.has('content-type') &&
      res.headers.get('content-type').startsWith('application/json')
    ) {
      // It's a nice JSON error returned by us, so decode it
      return res.json().then(err => Promise.reject(err));
    }
    // It's a less informative error returned by express
    return Promise.reject({
      status: res.status,
      message: res.statusText
    });
  }
  return res;
}

var api = {
  register: function (firstName, lastName, email, password) {
    const url = buildUrl(USERS_URL);
    const body = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  login: function (email, password) {
    const url = buildUrl(LOGIN_URL);
    const base64Encoded = window.btoa(`${email}:${password}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Encoded}`,
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  refresh: function (token) {
    const url = buildUrl(REFRESH_URL);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },  
  searchBooks: function (query) {
    query.key = GOOGLE_API_KEY;
    const url = buildGoogleUrl(BOOKS_API_URL, query);
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  details: function (userId, bookId) {
    console.log(JSON.stringify({userId, bookId}))
    console.log(typeof bookId)
    const url = buildUrl(`${USERS_URL}${userId}`);
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({userId, bookId})
    }).then(normalizeResponseErrors)
      .catch (err => {
        console.log(err)
      })
  },
  create: function (document, token) {
    const url = buildUrl(`${ITEMS_URL}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },  
  update: function (document, token) {
    const url = buildUrl(`${ITEMS_URL}${document.id}`);

    return fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  remove: function (id, token) {
    const url = buildUrl(`${ITEMS_URL}${id}`);

    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.text());
  }
};