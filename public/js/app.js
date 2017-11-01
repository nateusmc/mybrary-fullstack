/* global jQuery, handle */
'use strict';
/**
 * Event Listener
 * Primary Job:
 * - Listen for user events like `click`, and call event handler methods
 * - Pass the "state" and the event objects and the event handlers
 * 
 * Setup:
 * jQuery's document ready "starts" the app
 * Event listeners are wrapped in jQuery's document.ready function
 * state is inside document.ready so it is protected
 * 
 * 
 * Rule of Thumb:
 * - Never manipulation DOM directly
 * - Never make fetch/AJAX calls directly
 * - Updates to STATE/state allowed
 * 
 */

// Make state global so it can be easily accessed in Dev Tools 
var state;
//on document ready bind events
jQuery(function ($) {
  
  state = {
    demo: true,         // display in demo mode true | false
    view: null,         // current view: register | login | search | create | details | edit 
    backTo: null,       // previous view to go back to
    query: {},          // search query values
    list: null,         // search result - array of objects (documents)
    item: null,         // currently selected document
    action: null,       // current action, used to track parallel calls
    token: localStorage.getItem('authToken'), // jwt token

    // Simple token refresher
    timer: {            // timer to track token expiration
      status: null,     // current status: ok | warning | expired
      warning: 60000,   // inactivity warning threshold in ms
      remaining: null,  // calculated remaining until expire ms
      polling: 1000,    // frequency to checkExpiry in ms
    }
  };

  // Setup all the event listeners, passing STATE and event to handlers
  $('#register').on('submit', state, handle.register);
  $('#login').on('submit', state, handle.login);

  $('#create').on('submit', state, handle.create);
  $('#search').on('submit', state, handle.search);

  $('#edit').on('submit', state, handle.update);

  $('#result').on('click', '.detail', state, handle.details);
  $('#result').on('click', '.remove', state, handle.remove);
  $('#detail').on('click', '.edit', state, handle.viewEdit);
  
  $(document).on('click', '.viewCreate', state, handle.viewCreate);
  $(document).on('click', '.viewLogin', state, handle.viewLogin);
  $(document).on('click', '.viewRegister', state, handle.viewRegister);
  $(document).on('click', '.viewSearch', state, handle.viewSearch);

  $('body').on('click', state, handle.refresh);

  // start app by triggering a search
  // $('#search').trigger('submit');
  
  // call checkExpiry once on document.ready
  handle.checkExpiry(state);
  // poll checkExpiry every few seconds to update status bar
  setInterval(() => handle.checkExpiry(state), state.timer.polling);

});
