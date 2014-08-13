// app.js

// IIFE, declares db object on window
(function(window){
  // Database object  
  var app = {};
  
  // Holds array of past sightings
  app.sightings = [];
  
  // Holds array of user's current location -- lat, long
  app.userLocation = [];
  
  // Create Google map objects
  function loadMap(){
  // Create map object
    var testLatLong = new google.maps.LatLng(33,50);
    var map = new google.maps.Map(document.getElementById('sightings-map'),{
      zoom: 12,
    });

    // Add markers and infowindows to map
    var infowindow = new google.maps.InfoWindow();
    var marker;
    var markerArray = [];
    for(var i=0;i<app.sightings.length;i++){
      // Add markers
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(app.sightings[i][1],app.sightings[i][2]),
        map: map
      });
      markerArray.push(marker);
      // Add infowindows
      google.maps.event.addListener(marker,'click',(function(marker,i){
        return function(){
          infowindow.setContent(app.sightings[i][0]);
          infowindow.open(map,marker);
        };
      })(marker,i));
    }

    // Center map on all markers
    var limits = new google.maps.LatLngBounds();
    $.each(markerArray,function(index,newMarker){
      limits.extend(newMarker.position);
    });
    map.fitBounds(limits);
  }
  
  // 3 second alert message
  function sightingAlert(){
    function timer(){window.setTimeout(hideAlert, 3000)}
    function showAlert(timer){
      $('#sighting-alert-hide').attr('id','sighting-alert-show');
      timer();
    }
    function hideAlert(){
      $('#sighting-alert-show').attr('id','sighting-alert-hide')
    }
    showAlert(timer);
  }
  
  // Update the sightings count on the home page
  function updateCount(){
    $.getJSON('http://slaughterspottr.herokuapp.com/api/count',function(data){
        $('#spot-count').replaceWith('<span id=\'spot-count\'>'+data.count+'</span>');
      });
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

  // Locate the user's current location
  app.locateMe = function(){
    var output = document.getElementById("user-location-map");
    if (!navigator.geolocation){
      output.innerHTML = 'Geolocation is not supported by your browser!';
      return;
    }
    function success(position){
      var latitude = app.userLocation[0] = position.coords.latitude;
      var longitude = app.userLocation[1] = position.coords.longitude;
      
      // Create new static Google map
      var img = new Image();
      img.src = 'http://maps.googleapis.com/maps/api/staticmap?center='+latitude+','+longitude+'&zoom=13&size=200x200&markers=color:red%7Clabel:%7C'+latitude+','+longitude+'&sensor=false';
      output.innerHTML = '';
      output.appendChild(img);
      
      // Get human-readable address from Google
      $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude,function(data){
        var address = data.results[0].formatted_address;
        address = address.split(',');
        var formattedAddress = address[0]+'<br>';
        for(var i=1;i<address.length;i++){
          formattedAddress = formattedAddress+address[i]+'<br>';
        }
        $('#user-address').replaceWith('<span id=\'user-address\'>'+formattedAddress+'</span>');
      });
    };
    function error() {
      output.innerHTML = 'Geolocation is required for SlaughterSpottr!';
    };
    output.innerHTML = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  };
  
  // Post a new sighting
  app.reportSighting = function(){
    var newLocation = app.userLocation[0]+','+app.userLocation[1];
    $.ajax({
      type: 'PUT',
      url: 'http://slaughterspottr.herokuapp.com/api/add?location='+newLocation,
      success: success,
      error: error,
      dataType: 'text'
    });
    function error(result){
      alert('Error posting sighting, try again!');
    }
    function success(result){
      // Show 2 second alert indicating successful PUT
      sightingAlert();
      updateCount();
    }
  };

  // Register the app object on the window.
  window.app = app;
}(window));