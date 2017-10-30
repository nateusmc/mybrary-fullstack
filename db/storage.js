'use strict';
const uuid = require('uuid');

const Storage = {
  addOne: function (item) {
    item.id = item.id || uuid.v4();
    this.items[item.id] = item;
    return item;
  },
  getList: function (query) {
    const list = Object.keys(this.items).map(key => this.items[key]);
    if (!Object.keys(query).length) { return list; }
    const newList = [];
    list.forEach(function (element) {
      const key = Object.keys(query)[0];
      if ((element[key].indexOf(query[key]) > -1)) {
        newList.push(element);
      }
    });
    return newList;
  },
  getOne: function (id) {
    return this.items[id];
  },
  modOne: function (updatedItem) {
    const { id } = updatedItem;
    if (!(id in this.items)) {
      throw StorageException(`Item \`${id}\` because doesn't exist.`);
    }
    this.items[updatedItem.id] = updatedItem;
    return updatedItem;
  },
  delOne: function (id) {
    delete this.items[id];
  }
};

module.exports = function (name) {
  const storage = Object.create(Storage);
  storage.name = name;
  storage.items = {};
  return storage;
};