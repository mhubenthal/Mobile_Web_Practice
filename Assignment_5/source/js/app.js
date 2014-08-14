// app.js

// IIFE, declares db object on window
(function(window){
  // Database object  
  var app = {};
  app.settings = [];
  
  // Holds array of past sightings
  app.empData = [];
  
  // Check if data is present in localStorage, add if not
  function checkLocalStorage(){
    var result = false;
    // User has been here before, look at localStorage
    if(localStorage.getItem('empData')){
      // Create/load settings, game and results objects
      var settings = {};
      app.settings[0] = $("#select-location").val();
      app.settings[1] = $("#select-practice").val();
      result = true;
    }
    // New data, set up localStorage
    if(localStorage && !localStorage.getItem('empData')){
      // Set up new user with some preloaded values
      //   for this first visit.
      var empData = app.empData;
      localStorage.setItem('empData', JSON.stringify(empData));
      // Create/load settings, game and results objects
      app.settings[0] = $("#select-location").val();
      app.settings[1] = $("#select-practice").val();
      result = true;
    }
    return result;
  }
  
  // Update game settings
  function updateSettings(newLocation,newPractice){
    var settings = JSON.parse(localStorage.getItem('settings'));
    settings.location = app.settings[0] = newLocation;
    settings.practice = app.settings[1] = newPractice;
    localStorage.setItem('settings', JSON.stringify(settings));
  }
  
  // Load a new game of ten rounds
  function loadGame(){
    // Get employee data
    var allEmp = JSON.parse(localStorage.getItem('empData'));
    // Get all employees based on settings
    var selectEmp = [];
    for(var i=0;i<allEmp.length;i++){
      if(allEmp[i].Location===app.settings[0]&&allEmp[i].PracticeArea===app.settings[1]){
        selectEmp.push(allEmp[i]);
      }
      else{}
    }
    $(selectEmp).each(function(i){
      console.log(selectEmp[i].Location + ' ' +selectEmp[i].PracticeArea);
    });
    var game = {};
    game.rounds = [];
    game.results = [];
    localStorage.setItem('game', JSON.stringify(game));
  }
  
  // ***********************
  //
  // APP PUBLIC METHODS
  //
  // ***********************

  // Parse and load data into sightings array
  app.loadData = function(newData){
    // Create array of sightings to load
    app.empData = newData;
    // Add employee data to localStorage if not present
    var success = checkLocalStorage();
    // Output an alert to the user
    if(!success){
      alert('Your browser does not support localStorage, this game will not work, sorry!');
    }
  };
  
  // Update Settings
  app.updateSettings = function(location,practice){
    updateSettings(location,practice);
  };
  
  // Load a game
  app.loadGame = function(){
    loadGame();
  };

  // Register the app object on the window.
  window.app = app;
}(window));