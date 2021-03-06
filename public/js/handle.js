'use strict';
var handle = {
  register: function (event) {
    event.preventDefault();
    const state  = event.data;
    const el = $(event.target);
    const firstName = el.find('[name=firstname]').val().trim();
    const lastName = el.find('[name=lastname]').val().trim();
    const email = el.find('[name=email]').val().trim();
    const password = el.find('[name=password]').val().trim();
    const confirmPassword = el.find('[name=c-password]').val().trim();
    el.trigger('reset');
    if (confirmPassword !== password) {
      alert('Confirm Password and Password must match');
    }
    api.register(firstName, lastName, email, password, confirmPassword)
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
    const email = el.find('[name=email]').val().trim();
    const password = el.find('[name=password]').val().trim();
    state.action = 'getToken';
    api.login(email, password)
      .then(response => {
        console.log(response);
        state.action = null;
        state.token = response.authToken;
        state.userId = response.id;
        localStorage.setItem('authToken', state.token);
        localStorage.setItem('userId', state.userId);
        state.view = (state.backTo) ? state.backTo : 'search';
        render.page(state);
        document.location.reload();
      }).catch(err => {
        state.action = null;
        if (err.reason === 'ValidationError') {
          console.error('ERROR:', err.reason, err.message);
        } else {
          console.error('ERROR:', err);
        }
      });
  },
  logout: (event) => {
    const state = event.data;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    state.token = null;
    state.userId = null;
    state.view = 'login';
    render.page(state);
  },
  refresh: function (event) {
    const state = event.data;
    const timer = state.timer;
    if (state.action === 'getToken') { return; }
    if (state.token && timer.remaining < timer.warning) {
      api.refresh(state.token)
        .then(response => {
          state.token = response.authToken;
          localStorage.setItem('authToken', state.token);
        }).catch(err => {
          state.token = null;
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
    var query = {};
    if (name) {
      query = {
        q: el.find('[name=name]').val()
      };
    }
    api.searchBooks(query)
      .then(response => {
        state.list = response;
        render.results(state);
        state.view = 'search';
        render.page(state);
      }).catch(err => {
        console.error('ERROR:', err);
      });
  },
  details: function (event) {        event.preventDefault();
    const state = event.data;
    const el = $(event.target);
    const id = el.closest('li').attr('id');
    const userId = state.userId;    
    console.log('UserID: ', userId, 'BookID: ', id);
    api.details(userId, id)
      .then(response => {
        state.item = response;
        render.detail(state);
        state.view = 'search';
        render.page(state);
      }).catch(err => {
        state.error = err;
      });
  },
  dashboardBooks: function (event) {
    const userId = state.userId;
    const token = state.token;
    console.log(userId);
    api.findUserById(userId, token)
      .then(user => {
        const bookIds = user.bookIds;
        let bookPromises = [];
        for (let i = 0; i < bookIds.length; i++) {
          bookPromises.push(api.getBookById(bookIds[i]));
        }
        Promise.all(bookPromises)
          .then((res) => {
            state.items = res;
            render.books(state);
          });
      });
  },
  remove: function (event) {
    event.preventDefault();
    const state = event.data;
    const el = $(event.target);
    const bookId = el.closest('li').attr('data-bookId');
    const userId = localStorage.getItem('userId');
    api.remove(userId, bookId,  state.token)
      .then(() => {
        state.list = null;
        return handle.viewDashboard(event);
      }).catch(err => {
        if (err.status === 401) {
          state.backTo = state.view;
          state.view = 'register';
          render.page(state);
        }
        console.error('ERROR:', err);
      });
  },
  viewLogin: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'login';
    render.page(state);
  },
  viewRegister: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'register';
    render.page(state);
  },
  viewSearch: function (event) {
    event.preventDefault();
    const state = event.data;
    if (state.list) {
      state.view = 'search';
      render.page(state);
    }
    else {
      $('#search').trigger('submit');
    }
  },
  viewHome: function (event){
    const state = event.data;
    if(state.list) {
      state.view = null;
      render.page(state);
    }
  },
  viewDashboard: function (event) {
    event.preventDefault();
    const state = event.data;
    state.view = 'dashboard';
    handle.dashboardBooks();
    render.page(state);
  }
};