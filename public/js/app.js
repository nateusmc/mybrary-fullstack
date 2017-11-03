'use strict';

var state;
jQuery(function ($) {
  
  state = {
    demo: false,         // display in demo mode true | false
    view: null,         // current view: register | login | search | create | details | edit 
    backTo: null,       // previous view to go back to
    query: {},          // search query values
    list: null,         // search result - array of objects (documents)
    item: null,         // currently selected document
    action: null,       // current action, used to track parallel calls
    token: localStorage.getItem('authToken'), // jwt token
    userId: localStorage.getItem('userId'),
    // Simple token refresher
    timer: {            // timer to track token expiration
      status: null,     // current status: ok | warning | expired
      warning: 60000,   // inactivity warning threshold in ms
      remaining: null,  // calculated remaining until expire ms
      polling: 1000,    // frequency to checkExpiry in ms
    }
  };

  $('#register').on('submit', state, handle.register);
  $('#login').on('submit', state, handle.login);
  $('#logout').on('click', state, handle.logout);
  $('#search').on('submit', state, handle.search);
  $('#result').on('click', '.detail', state, handle.details);
  $('#remove').on('click', '.remove', state, handle.remove);
  
  $(document).on('click', '.viewLogin', state, handle.viewLogin);
  $(document).on('click', '.viewRegister', state, handle.viewRegister);
  $(document).on('click', '.viewSearch', state, handle.viewSearch);
  $(document).on('click', '.viewHome', state, handle.viewHome);
  $(document).on('click', '.viewDashboard', state, handle.viewDashboard);

  $('body').on('click', state, handle.refresh);

  handle.checkExpiry(state);
  // setInterval(() => handle.checkExpiry(state), state.timer.polling);

});
