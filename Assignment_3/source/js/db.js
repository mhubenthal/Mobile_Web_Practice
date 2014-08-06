// db.js
// Basic CRUD operations on IndexedDB database

// Adjust for vendor prefixes
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// IIFE, declares db object on window
(function(window){
  //'use strict';
  // Database object  
  var db = {
    version: 3, // important: only use whole numbers!
    name: 'places',
    objectStoreNames: ['locationData','zipcodeData'],
    instance: {},
    upgrade: function(e){
      var _db = e.target.result; 
      //names = _db.objectStoreNames, 
      var names = db.objectStoreNames;
      //if(!names[0].contains(name)){
      _db.createObjectStore(names[0], {keyPath: 'id', autoIncrement: true});
      _db.createObjectStore(names[1], {keyPath: 'id', autoIncrement: true});
      console.log(_db);
    },

    // Generic error handler
    errorHandler: function (error){
        window.alert('error: ' + error.target.code);
        debugger; // Open console debugger
    },

    // Open database
    open: function (callback){
      console.log('open');
      var request = window.indexedDB.open(db.objectStoreNames, db.version);
      request.onerror = db.errorHandler;
      request.onupgradeneeded = db.upgrade;
      request.onsuccess = function(e){
        console.log('success');
        db.instance = request.result;
        db.instance.onerror = db.errorHandler;
        callback();
      };
    },

    // Get the current db object store, pass in the mode
    getObjectStore: function(mode){
      var txn, store;
      // Define as 'readonly' if undefined
      mode = mode || 'readonly'; 
      // Open a transaction for db within object store in selected mode
      txn = db.instance.transaction([db.objectStoreName], mode); 
      store = txn.objectStore(db.objectStoreName);
      return store;
    },

    // Add/update an item in db (CREATE/UPDATE)
    save: function(data, callback){
      // Call 'open' to open db
      db.open(function(){
        var store, request, mode = 'readwrite';
        store = db.getObjectStore(mode),
        // Call 'put' if the item has a keyPath, otherwise 'add'
        request = data.id ? store.put(data) : store.add(data);
        request.onsuccess = callback;
      });
    },

    // Retrieve all items from the db (READ)
    getAll: function(callback){
      // Call 'open' to open db
      db.open(function(){
        var store = db.getObjectStore(), cursor = store.openCursor(), data = [];
        cursor.onsuccess = function(e){
          var result = e.target.result;
          // If value is found and not null, add to data for callback function
          if(result && result !== null){
            data.push(result.value);
            result.continue();
          } 
          else{
            callback(data);
          }
        };
      });
    },

    // Get a single item from the store (READ)
    get: function(id, callback){
      id = parseInt(id);
      db.open(function(){
        var store = db.getObjectStore(), request = store.get(id);
        request.onsuccess = function(e){
          callback(e.target.result);
        };
      });
    },

    // Delete a single item from the store (DELETE)
    'delete': function(id, callback){
      id = parseInt(id);
      db.open(function(){
        var mode = 'readwrite', store, request;
        store = db.getObjectStore(mode);
        request = store.delete(id);
        request.onsuccess = callback;
      });
    },

    // Delete all items from the store (DELETE)
    deleteAll: function(callback){
      db.open(function(){
        var mode, store, request;
        mode = 'readwrite';
        store = db.getObjectStore(mode);
        request = store.clear();
        request.onsuccess = callback;
      });
    }
  };

  window.app = window.app || {};
  window.app.db = db;

}(window));