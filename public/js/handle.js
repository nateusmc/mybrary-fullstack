/* global $, render, api */
'use strict';

/**
 * 
 * Event Handlers validate input, update STATE and call render methods
 */

var handle = {
  signup: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);
    const username = el.find('[name=username]').val().trim();
    const password = el.find('[name=password]').val().trim();
    el.trigger('reset');

    api.signup(username, password)
      .then(() => {
        state.view = 'login';
        render.page(state);
      }).catch(err => {
        if (err.reason === 'ValidationError') {
          console.error('ERROR:', err.reason, err.message);
        } else {
          console.error('ERROR:', err);
        }
      });
  },

  login: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);
    const username = el.find('[name=username]').val().trim();
    const password = el.find('[name=password]').val().trim();
    state.action = 'getToken';
    api.login(username, password)
      .then(response => {
        state.action = null;
        state.token = response.authToken;
        localStorage.setItem('authToken', state.token);
        state.view = (state.backTo) ? state.backTo : 'search';
        render.page(state);
      }).catch(err => {
        state.action = null;
        if (err.reason === 'ValidationError') {
          console.error('ERROR:', err.reason, err.message);
        } else {
          console.error('ERROR:', err);
        }
      });
  },

  refresh: function (event) {
    // don't preventDefault on this one!
    const state = event.data;
    const timer = state.timer;
    if (state.action === 'getToken') { return; }
    if (state.token && timer.remaining < timer.warning) {
      api.refresh(state.token)
        .then(response => {
          state.token = response.authToken;
          localStorage.setItem('authToken', state.token);
        }).catch(err => {
          state.token = null; // remove expired token
          localStorage.removeItem('authToken');
          console.error('ERROR:', err);
        });
    }
  },

  checkExpiry: function (state) {
    const timer = state.timer;
    if (state.token) {
      var section = state.token.split('.')[1];
      var payload = window.atob(section);
      var decoded = JSON.parse(payload);
      var now = new Date();
      var expiry = new Date(0);
      expiry.setUTCSeconds(decoded.exp);

      timer.remaining = Math.floor(expiry - now);
      console.log('Seconds: ', Math.floor(timer.remaining / 1000));
      if (timer.remaining < 0) {
        timer.status = 'expired';
      } else if (timer.remaining <= timer.warning) {
        timer.status = 'warning';
      } else {
        timer.status = 'ok';
      }
      render.status(state);
    }
  },

  search: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);
    const name = el.find('[name=name]').val();
    var query;
    if (name) {
      query = {
        name: el.find('[name=name]').val()
      };
    }
    api.search(query)
      .then(response => {
        state.list = response;
        render.results(state);

        state.view = 'search';
        render.page(state);
      }).catch(err => {
        console.error('ERROR:', err);
      });
  },

  create: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);

    const document = {
      name: el.find('[name=name]').val()
    };
    api.create(document, state.token)
      .then(response => {
        state.item = response;
        state.list = null; //invalidate cached list results
        render.detail(state);
        state.view = 'detail';
        render.page(state);
      }).catch(err => {
        if (err.status === 401) {
          state.backTo = state.view;
          state.view = 'signup';
          render.page(state);
        }
        console.error('ERROR:', err);
      });
  },

  update: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);

    const document = {
      id: state.item.id,
      name: el.find('[name=name]').val()
    };
    api.update(document, state.token)
      .then(response => {
        state.item = response;
        state.list = null; //invalidate cached list results
        render.detail(state);
        state.view = 'detail';
        render.page(state);
      }).catch(err => {
        if (err.status === 401) {
          state.backTo = state.view;
          state.view = 'signup';
          render.page(state);
        }
        console.error('ERROR:', err);
      });
  },

  details: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);

    const id = el.closest('li').attr('id');
    api.details(id)
      .then(response => {
        state.item = response;
        render.detail(state);

        state.view = 'detail';
        render.page(state);

      }).catch(err => {
        state.error = err;
      });
  },

  remove: function (event) {
    event.preventDefault();
    const state = event.data;
    const id = $(event.target).closest('li').attr('id');

    api.remove(id, state.token)
      .then(() => {
        state.list = null; //invalidate cached list results
        return handle.search(event);
      }).catch(err => {
        if (err.status === 401) {
          state.backTo = state.view;
          state.view = 'signup';
          render.page(state);
        }
        console.error('ERROR:', err);
      });
  },
  viewCreate: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'create';
    render.page(state);
  },
  viewLogin: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'login';
    render.page(state);
  },
  viewSignup: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'signup';
    render.page(state);
  },
  viewSearch: function (event) {
    event.preventDefault();
    const state = event.data;
    if (!state.list) {
      handle.search(event);
      return;
    }
    state.view = 'search';
    render.page(state);
  },
  viewEdit: function (event) {
    event.preventDefault();
    const state = event.data;
    render.edit(state);

    state.view = 'edit';
    render.page(state);
  }
};
