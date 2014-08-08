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
    version: 1,
    name: 'Places',
    objectStoreNames: ['locationData','zipcodeData'],
    instance: {},
    searchFinished: false,
    searchResults: []
  }
    
  // Upgrade is needed on db
  function upgrade(e){
    console.log('Database upgrade...');
    var _db = e.target.result;  
    var names = db.objectStoreNames;
    // Create objectStores and indices
    var locationStore = _db.createObjectStore(names[0], {autoIncrement: true});
    var zipcodeStore = _db.createObjectStore(names[1], {autoIncrement: true});
    locationStore.createIndex('locationData','city',{unique: false});
    zipcodeStore.createIndex('zipcodeData','zipcode',{unique: false});
    // Load records from .json files into IndexedDB, check that
    //   objectStore creation is complete
    locationStore.transaction.oncomplete = loadJSONDataset(['locationData'],'data/locations.json');
    zipcodeStore.transaction.oncomplete = loadJSONDataset(['zipcodeData'],'data/zipcodes.json');
  }
    
  // Load .json files into 'Places' db
  //   Takes an array of 1 objectStore to load to
  function loadJSONDataset(storeToLoad,fileLocation){
    console.log('Loading JSON data...');
    // Use AJAX w/jQuery to get JSON
    $.getJSON(fileLocation,function(data){
      var store, request, dataLength, counter=0, mode='readwrite';
      store = getObjectStore(storeToLoad, mode);
      dataLength = data.length;
      // Load records into store
      for(var i=0;i<dataLength;i++){
        request = store.add(data[i]);
        request.onerror = function(){console.log('request error')};
        request.onsuccess = doneCallback;
      }
      function doneCallback(){
        counter++;
        if(counter===dataLength){
          console.log('Finished loading: '+storeToLoad);
          console.log('Number of items: '+counter);
        }
      }
    });
  }

  // Generic error handler
  function errorHandler(error){
      window.alert('error: ' + error.target.code);
      debugger; // Open console debugger
  }

  // Open database
  function openDB(callback){
    console.log('Opening database...');
    var request = window.indexedDB.open(db.name, db.version);
    request.onerror = errorHandler;
    var needsUpgrade = request.onupgradeneeded;
    request.onupgradeneeded = upgrade;
    request.onsuccess = function(e){
      console.log('Database finished opening.');
      db.instance = request.result;
      db.instance.onerror = errorHandler;
      callback();
    };
  }

  // Get the current db object store(s), pass in the mode
  //   'storeToGet' is an array of 1 objectStore the
  //    transaction should span.
  function getObjectStore(storeToGet, mode){
    var txn, store;
    // Define as 'readonly' if undefined
    mode = mode || 'readonly'; 
    // Open a transaction for db within object store in selected mode
    txn = db.instance.transaction(storeToGet[0], mode);
    store = txn.objectStore(storeToGet[0]);
    return store;
  }
  
  // Search for a set of records from the zipcode store using zip index
  function searchDatabaseByZip(zipToSearch,callback){
    var txn, req, store, idx, zipArray = [], done = false; 
    // Request the index for the specified objectStore
    txn = db.instance.transaction('zipcodeData', 'readonly');
    store = txn.objectStore('zipcodeData');
    idx = store.index('zipcodeData');
    // Make a cursor request, bound by the queried zipcode
    console.log(zipToSearch);
    req = idx.openCursor(IDBKeyRange.bound(zipToSearch,zipToSearch+1));
    req.onsuccess = function(e){
      var cursor = e.target.result;
      if(cursor){
        zipArray.push(e.target.result.value);
        cursor.continue();
      }
      else{
        callback(zipArray);
      }
    };
  }
  
  // Search for a set of records from the zipcode store using zip index
  function searchDatabaseByCity(cityToSearch,callback){
    var txn, req, store, idx, cityArray = [], done = false; 
    // Request the index for the specified objectStore
    txn = db.instance.transaction('locationData', 'readonly');
    store = txn.objectStore('locationData');
    idx = store.index('locationData');
    // Make a cursor request, bound by the queried zipcode
    console.log(cityToSearch);
    req = idx.openCursor(IDBKeyRange.bound(cityToSearch,cityToSearch));
    req.onsuccess = function(e){
      var cursor = e.target.result;
      if(cursor){
        cityArray.push(e.target.result.value);
        cursor.continue();
      }
      else{
        callback(cityArray);
      }
    };
  }

    /* Add/update one item in a db store (CREATE/UPDATE)
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
    }, */

    /* Retrieve all items from the specified db store (READ)
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
    }, */

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
  
  // Call to load db into indexedDB
  db.loadData = function(){
    openDB(function(){
      console.log();
    });
  };
  
  // Call for zip only search
  db.searchByZip = function(zipToSearch,callback){
    // Clear any old search data
    db.searchFinished = false;
    db.searchResults = [];
    searchDatabaseByZip(zipToSearch,function(newArray){
      db.searchResults = newArray;
      db.searchFinished = true;
      callback(newArray);
    });
  };
    
  // Call for city only search
  db.searchByCity = function(cityToSearch,callback){
    // Clear any old search data
    db.searchFinished = false;
    db.searchResults = [];
    searchDatabaseByCity(cityToSearch,function(newArray){
      db.searchResults = newArray;
      db.searchFinished = true;
      callback(newArray);
    });
  };
    
  // Call for search using zip and city
  db.searchByZipCity = function(zipCityArray){
    return locations;
  };

  // Register the db on the window.app object.
  // Create the app object if not already present.
  window.app = window.app || {};
  window.app.db = db;

}(window));