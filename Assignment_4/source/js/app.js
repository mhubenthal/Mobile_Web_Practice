// app.js

// IIFE, declares db object on window
(function(window){
  // Database object  
  var app = {};
  
  // Holds array of past sightings
  app.sightings = [];
  
  // Create Google map objects
  function loadMap(){
    // Create map object
      var map = new google.maps.Map(document.getElementById('sightings-map'),{
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      
      // Add markers and infowindows to map
      var infowindow = new google.maps.InfoWindow();
      var marker;
      for(var i=0;i<app.sightings.length;i++){
        // Add markers
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(app.sightings[i][1],app.sightings[i][2]),
          map: map
        });
        // Add infowindows
        google.maps.event.addListener(marker,'click',(function(marker,i){
          return function(){
            infowindow.setContent(app.sightings[i][0]);
            infowindow.open(map,marker);
          }
        })(marker,i));
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
      for(var i=0;i<newData.length;i++){
        app.sightings.push([newData[i].date,newData[i].lat,newData[i].lon]);
      }
    };
  
    // Display all sightings on map
    app.displaySightings = function(){
      // Clear old map
      $('#sightings-map').replaceWith('<div id=\'sightings-map\'></div>');

      // Create Google map
      loadMap();
    };

  // Register the app object on the window.
  window.app = app;
}(window));