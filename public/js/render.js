'use strict';

var render = {
  page: function (state) {
    if (state.demo) {
      $('.view').css('background-color', 'gray');
      $('#' + state.view).css('background-color', 'white');
    } else {
      $('.view').hide();
      $('#' + state.view).show();  
    }
  },
  results: function (state) {
    const listItems = state.list.items.map((item) => {
      return `<li id="${item.id}">
                <a href="#" class="detail">Name: ${item.volumeInfo.title}</a>
              </li>`;
    });
    $('#result').empty().append('<ul>').find('ul').append(listItems);
  },
  detail: function (state) {
    const el = $('#detail');
    const item = state.item;
    el.find('.name').text(item.name);
  },
  status: function (state) {
    const timer = state.timer;
    switch (timer.status) {
    case 'warning':
      $('#statusbar').css('background-color', 'orange').find('.message').text(timer.status);
      break;
    case 'expired':
      $('#statusbar').css('background-color', 'red').find('.message').text(timer.status);
      break;
    default:
      $('#statusbar').css('background-color', 'green').find('.message').text(timer.status);
      break;
    }
  },
  books: function (state) {
    const listItems = state.items.map((item) => {
      const bookTitle = item.items[0].volumeInfo.title;
      const bookDescription = item.items[0].volumeInfo.description;
      const bookId = item.items[0].id;
      return `<li id="remove" data-bookId="${bookId}">
                <div class="detail">Title: ${bookTitle}</div><br>
                <div class="detail">Description: ${bookDescription}</div><br>
                <a href=""   class="remove">X</a><br>
              </li>`;
    });
    $('#dashboardBooks').empty().append('<ul>').find('ul').append(listItems);
  },
};