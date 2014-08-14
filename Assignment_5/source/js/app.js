// app.js

// IIFE, declares db object on window
(function(window){
  // App object  
  var app = {};
  app.settings = [];
  app.gameResults = [];
  // Holds array of employee data
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
  
  // Load a new game of ten rounds
  function loadGame(callback){
    var game = {};
    game.rounds = []; // Array of 10 numbers pointing to correct answers, in order of game play
    game.selectEmp = []; // Holds list of 10 trivia items and wrong answers

    // Get employee data
    var allEmp = JSON.parse(localStorage.getItem('empData'));
    // Get all employees based on settings
    var index = 0;
    for(var i=0;i<allEmp.length;i++){
      // Retrieve employees based on settings
      if((allEmp[i].Location===app.settings[0])&&(allEmp[i].PracticeArea===app.settings[1])){
        game.selectEmp[index] = allEmp.splice(i,1)[0];
        index++;
      }
      else{}
    }
    // Pad out results so 10 rounds may be played
    var remainder = 10-game.selectEmp.length;
    for(var i=0;i<remainder;i++){
      var randomVal = Math.floor(Math.random()*allEmp.length);
      game.selectEmp[index] = allEmp.splice(randomVal,1)[0];
      index++;
    }
    // Add array of name choices for game
    for(var i=0;i<game.selectEmp.length;i++){
      var randomVal = Math.floor(Math.random()*allEmp.length);
      var newWrongEmp = allEmp.splice(randomVal,1)[0];
      game.selectEmp[i].nameChoices = [];
      game.selectEmp[i].nameChoices[0] = newWrongEmp.FirstName+' '+newWrongEmp.LastName;
      var randomVal = Math.floor(Math.random()*allEmp.length);
      var newWrongEmp = allEmp.splice(randomVal,1)[0];
      game.selectEmp[i].nameChoices[1] = newWrongEmp.FirstName+' '+newWrongEmp.LastName;
      game.selectEmp[i].nameChoices[2] = game.selectEmp[i].FirstName+' '+game.selectEmp[i].LastName;
      // Get random ordering of right and wrong answers
      var order = [0,1,2];
      game.selectEmp[i].answerOrder = [];
      for(var j=0;j<3;j++){
        var randomVal = Math.floor(Math.random()*order.length);
        game.selectEmp[i].answerOrder[j] = order.splice(randomVal,1)[0];
      }
    }
    // Create array of 10 rounds
    order = [0,1,2,3,4,5,6,7,8,9];
    for(var i=0;i<10;i++){
      var randomVal = Math.floor(Math.random()*order.length);
      game.rounds[i] = order.splice(randomVal,1)[0];
    }
    // Start game
    callback(game);
  }
  
  // Play game
  function playGame(newGame){
    var done = false;
    var i = 0;
    // Set the buttons to new values
    function setButtons(i){
      // Set button values
      $('#top-button').html('<button id=\"default-button\" data-role=\"button\" >'+newGame.selectEmp[newGame.rounds[i]].nameChoices[newGame.selectEmp[newGame.rounds[i]].answerOrder[0]]+'</button>');
      $('#middle-button').html('<button id=\"default-button\" data-role=\"button\" >'+newGame.selectEmp[newGame.rounds[i]].nameChoices[newGame.selectEmp[newGame.rounds[i]].answerOrder[1]]+'</button>');
      $('#bottom-button').html('<button id=\"default-button\" data-role=\"button\" >'+newGame.selectEmp[newGame.rounds[i]].nameChoices[newGame.selectEmp[newGame.rounds[i]].answerOrder[2]]+'</button>');
    }
    
    // Game loop
    var done = false;
    while(!done){
        
    }
    
      
      // Wait for user to choose a value
      $('button').click(function(){
        var choice = $(this).text();
        var correct = newGame.selectEmp[newGame.rounds[i]].FirstName + ' ' + newGame.selectEmp[newGame.rounds[i]].LastName;
        // Correct choice
        if(correct===choice){
          $(this).attr('id', 'correct-button');
          //wait 2 seconds
          i++;
        }
        // Incorrect choice
        if(correct!==choice){
          $(this).attr('id', 'incorrect-button');
          //wait 2 seconds
          i++;
        }
      });
      // Exit loop after 10 rounds
      if(i===9){
        done=true;
      }
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
  
  // Load a game, pass playGame as a callback
  app.loadGame = function(){
    loadGame(playGame);
  };

  // Register the app object on the window.
  window.app = app;
}(window));