// db.js
// Basic CRUD operations on IndexedDB database

// Adjust for vendor prefixes
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// IIFE, declares db object on window
(function(window){
  // Database object  
  var db = {
    version: 2,
    name: 'Places',
    objectStoreNames: ['locationData','zipcodeData'],
    instance: {},
    
    // Upgrade is needed on db
    upgrade: function(e){
      console.log('upgrading');
      var _db = e.target.result;  
      var names = db.objectStoreNames;
      // Create objectStores and indices
      var locationStore = _db.createObjectStore(names[0], {autoIncrement: true});
      var zipcodeStore = _db.createObjectStore(names[1], {autoIncrement: true});
      locationStore.createIndex('locationData','city',{unique: false});
      zipcodeStore.createIndex('zipcodeData','zipcode',{unique: false});
      // Load records from .json files into IndexedDB, check that
      //   objectStore creation is complete
      console.log('calling load');
      locationStore.transaction.oncomplete = db.loadJSONDataset(['locationData'],'data/locations.json');
      zipcodeStore.transaction.oncomplete = db.loadJSONDataset(['zipcodeData'],'data/zipcodes.json');
    },
    
    // Load .json files into 'Places' db
    //   Takes an array of 1 objectStore to load to
    loadJSONDataset: function(storeToLoad,fileLocation){
      console.log('load dataset');
      // Use AJAX w/jQuery to get JSON
      $.getJSON(fileLocation,function(data){
        console.log('Loading');
        var store, request, dataLength, counter=0, mode='readwrite';
        store = db.getObjectStore(storeToLoad, mode);
        console.log('got: '+store);
        dataLength = data.length;
        // Load records into store
        for(var i=0;i<dataLength;i++){
          //console.log(data[i]);
          request = store.add(data[i]);
          request.onerror = function(){console.log('request error')};
          request.onsuccess = doneCallback;
        }
        function doneCallback(){
          counter++;
          if(counter===dataLength){
            alert('finished loading '+storeToLoad+' items: '+counter);
          }
        }
      });
    },

    // Generic error handler
    errorHandler: function (error){
        window.alert('error: ' + error.target.code);
        debugger; // Open console debugger
    },

    // Open database
    open: function (callback){
      var request = window.indexedDB.open(db.name, db.version);
      request.onerror = db.errorHandler;
      request.onupgradeneeded = db.upgrade;
      request.onsuccess = function(e){
        db.instance = request.result;
        db.instance.onerror = db.errorHandler;
        callback();
      };
    },

    // Get the current db object store(s), pass in the mode
    //   'storeToGet' is an array of 1 objectStore the
    //    transaction should span.
    getObjectStore: function(storeToGet, mode){
      var txn, store;
      // Define as 'readonly' if undefined
      mode = mode || 'readonly'; 
      // Open a transaction for db within object store in selected mode
      txn = db.instance.transaction(storeToGet[0], mode);
      store = txn.objectStore(storeToGet[0]);
      return store;
    },

    // Add/update one item in a db store (CREATE/UPDATE)
    //   'storeToAddTo' is an array of 1 objectStore.
    save: function(data, storeToAddTo, callback){
      // Call 'open' to open db
      db.open(function(){
        var store, request, mode = 'readwrite';
        store = db.getObjectStore(storeToAddTo, mode);
        var storeKey = store.keyPath;
        request = data[0][storeKey] ? store.put(data[0]) : store.add(data[0]);
        request.onsuccess = callback;
      });
    },

    // Retrieve all items from the specified db store (READ)
    //   'storeToGet' is an array of 1 store
    getAll: function(storeToGet, callback){
      // Call 'open' to open db
      db.open(function(){
        var store = db.getObjectStore(storeToGet), cursor = store.openCursor(), data = [];
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
    //   'storeToGet' is an array of 1 store.
    //   'itemToGet' is a string representing a key value.
    get: function(storeToGet, itemToGet, callback){
      db.open(function(){
        var store = db.getObjectStore(storeToGet);
        var index = store.index(store.indexNames[0]);
        index.get(itemToGet).onsuccess = function(e){
          callback(e.target.result);
        };
      });
    },

    /*
    // (** Not needed for this application. **)
    // Update to work for many-to-many relationships
    // Delete a single item from the store (DELETE)
    'delete': function(id, callback){
      console.log('delete');
      id = parseInt(id);
      db.open(function(){
        var mode = 'readwrite', store, request;
        store = db.getObjectStore(mode);
        request = store.delete(id);
        request.onsuccess = callback;
      });
    },
    
    // (** Not needed for this application. **)
    // Delete all items from the store (DELETE)
    deleteAll: function(callback){
      console.log('deleteall');
      db.open(function(){
        var mode, store, request;
        mode = 'readwrite';
        store = db.getObjectStore(mode);
        request = store.clear();
        request.onsuccess = callback;
      });
    }
    */
  };

  window.app = window.app || {};
  window.app.db = db;

}(window));