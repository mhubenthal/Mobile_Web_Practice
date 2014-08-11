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
    zipcodeSearchResults: [],
    locationSearchResults: []
  };
    
  // Upgrade is needed on db
  function upgrade(e){
    console.log('Database upgrade...');
    var _db = e.target.result;  
    var names = db.objectStoreNames;
    // Create objectStores and indices
    var locationStore = _db.createObjectStore(names[0], {keyPath: 'id'});
    var zipcodeStore = _db.createObjectStore(names[1], {keyPath: 'id'});
    // Create indexes based on city/zipcode info
    locationStore.createIndex('locationCityIndex','city',{unique: false});
    zipcodeStore.createIndex('zipcodeZipcodeIndex','zipcode',{unique: false});
    // Create indexes based on id
    locationStore.createIndex('locationIDIndex','id',{unique: true});
    zipcodeStore.createIndex('zipcodeIDIndex','id',{unique: true});
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
    idx = store.index('zipcodeZipcodeIndex');
    // Prepare upper bound to allow for partial searching
    var upperBound = zipToSearch;
    var diff = 5-zipToSearch.length;
    if(diff>=1){
      for(var i=0;i<diff;i++){
        //zipToSearch = zipToSearch + '0';
        upperBound = upperBound + '9';
      }
    }
    // Make a cursor request, bound by the queried zipcode
    req = idx.openCursor(IDBKeyRange.bound(zipToSearch,upperBound));
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
  
  // Search for a set of records from the city store using city index
  function searchDatabaseByCity(cityToSearch,callback){
    var txn, req, store, idx, cityArray = [], done = false; 
    // Request the index for the specified objectStore
    txn = db.instance.transaction('locationData', 'readonly');
    store = txn.objectStore('locationData');
    idx = store.index('locationCityIndex');
    // Set to an unlikely upper bound...possibly change this 'magic number'?
    var upperBound = cityToSearch + 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
    // Make a cursor request, bound by the queried city
    req = idx.openCursor(IDBKeyRange.bound(cityToSearch,upperBound));
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
  
  // Load selected map data
  function loadMap(clickedMap,callback){
    // Get id value of item
    var selectedID = clickedMap.children("td").attr("id");
    // Get the complete data for the selected item
    var txn, req, store, idx, dataArray = []; 
    // Request the index for the specified objectStore
    txn = db.instance.transaction('zipcodeData', 'readonly');
    store = txn.objectStore('zipcodeData');
    // Request the record by ID
    req = store.get(selectedID);
    req.onsuccess = function(e){
      // Add the locationData to the dataArray
      dataArray.push(e.target.result);
      txn = db.instance.transaction('locationData', 'readonly');
      store = txn.objectStore('locationData');
      // Request the record by ID
      req = store.get(selectedID);
      req.onsuccess = function(e){
        dataArray.push(e.target.result);
        // Display the results
        callback(dataArray);
      };
    };
  }
  
  // Display selected map in new window
  function displayMap(mapData){
    // Clear table
    $("tbody#placeTable").replaceWith("<tbody id=\"placeTable\"></tbody>");
    // Add selected item info
    $("#placeTable").append(
            "<tr><th class=\"mapButton\"><button class=\"ui-btn ui-shadow ui-corner-all ui-icon-location ui-btn-icon-notext ui-btn-inline\">Map</button></th><td id=\""+mapData[0].id+"\">"+mapData[0].zipcode+
            "</td><td>"+mapData[1].city+
            "</td><td>"+mapData[1].state+
            "</td></tr>"
          );
    
    
  }
  
  // ***********************
  //
  // DATABASE PUBLIC METHODS
  //
  // ***********************
  
  // Call to load db into indexedDB
  db.loadData = function(){
    console.log('Calling load');
    openDB(function(){
      console.log('Loading database.');
    });
  };
  
  // Call for zip only search
  db.searchByZip = function(zipToSearch,callback){
    // No value was entered, don't search entire db!
    if(zipToSearch.length===0){
      console.log('Nothing entered.');
    }
    else{
      // Clear any old search data
      db.zipcodeSearchResults = [];
      searchDatabaseByZip(zipToSearch,function(newArray){
        db.zipcodeSearchResults = newArray;
        callback(newArray);
      });
    }
  };
    
  // Call for city only search
  db.searchByCity = function(cityToSearch,callback){
    // No value was entered, don't search entire db!
    if(cityToSearch.length===0){
      console.log('Nothing entered.');
    }
    else{
      // Clear any old search data
      db.locationSearchResults = [];
      searchDatabaseByCity(cityToSearch,function(newArray){
        db.locationSearchResults = newArray;
        callback(newArray);
      });
    }
  };
  
  // Display map
  db.loadMap = function(callback){
    $(".mapButton").click(function(){
      var contents = $(this).parent();
      loadMap(contents,callback);
    });
  };

  // Register the db on the window.app object.
  // Create the app object if not already present.
  window.app = window.app || {};
  window.app.db = db;

}(window));