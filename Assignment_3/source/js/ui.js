//ui.js
// Main UI for site.

(function (window){
  // Global variable for use in browser
  var ui = {};
  
  // Output the place info as table elements
  function displayResults(newResults){
    // No results from search
    if(newResults.length===0){
      $("tbody#placeTable").replaceWith("<tbody id=\"placeTable\"><tr class=\"no-results\"><th><br>* NOTHING FOUND *</th></tr></tbody>");
    }
    // Something found in search
    else{
      // Clear table, in case of old search results
      $("tbody#placeTable").replaceWith("<tbody id=\"placeTable\"></tbody>");
      $("#location_map").replaceWith("<div id=\"location_map\"></div>");
      // Write data to HTML
      var displayIndex = 1;
      $.each(newResults, function(index,value){
        // Only display present elements
        if(value!==null){
          $("#placeTable").append(
            "<tr><th class=\"mapButton\"><button class=\"ui-btn ui-shadow ui-corner-all ui-icon-location ui-btn-icon-notext ui-btn-inline\">Map</button></th><td id=\""+value.id+"\">"+value.zipcode+
            "</td><td>"+value.city+
            "</td><td>"+value.state+
            "</td></tr>"
          );
          displayIndex++;
        }
        else{};
      });
    }
  }
  
  // Clear the results table
  function clearResults(){
    $("tbody#placeTable").replaceWith("<tbody id=\"placeTable\"><tr class=\"no-search\"><th><br>* NOTHING SEARCHED *</th></tr></tbody>");
    $("#location_map").replaceWith("<div id=\"location_map\"></div>");
  }
  
  // ***********************
  //
  // UI PUBLIC METHODS
  //
  // ***********************
  
  // Display results
  ui.displayResults = function(newResults){
    displayResults(newResults);
  };
  
  // Clear results table
  ui.clearResults = function(){
    clearResults();
  };
  
  // Register the ui on the window.app object.
  // Create the app object if not already present.
  window.app = window.app || {};
  window.app.ui = ui;
  
}(window));