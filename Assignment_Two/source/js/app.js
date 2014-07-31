(function (window){
  // Global variable for use in browser
  var quake = {};
  // Holds array of quakes from past 30 days
  var quakes = [];
  
  // Load the JSON object of most recent quakes using YQL Url
  // Data comes from an XML feed from the USGS of earthquakes in the
  //   past 30 days.
  function loadJSON(){
    var newObj = {};
    var http_req = new XMLHttpRequest();
    http_req.onreadystatechange  = function(){
      if (http_req.readyState === 4){
        // Javascript function JSON.parse to parse JSON data
        newObj = JSON.parse(http_req.responseText);
      
        // Parse data
        parseQuakes(newObj);
      }
    };
    http_req.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Fearthquake.usgs.gov%2Fearthquakes%2Fshakemap%2Frss.xml%22&format=json&diagnostics=true&callback=", true);
    http_req.send();
  }
  
  // Parse the JSON quake data into an array of all quakes
  function parseQuakes(jsonData){
    quakes = jsonData.query.results.item;
    console.log(quakes);
    // Write data to DOM
    displayQuakes(quakes);
  }
  
  // Output the quakes as a list
  function displayQuakes(quakeArray){
    $.each(quakeArray, function(index,value){
      
        // Large quake, shade dark red
        if(value.subject >= 7){
          $("#quakeTable").append(
            "<tr id=\"largeQuake\"><th id=\"quakeItem\" class=\"ui-shadow-icon ui-btn ui-shadow ui-corner-all ui-icon-plus \"></th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+value.seconds+
            "</td></tr>"
          );
        };
        // Medium quake, shade light red
        if(value.subject >=5){
          $("#quakeTable").append(
            "<tr id=\"mediumQuake\"><th id=\"quakeItem\" class=\"ui-shadow-icon ui-btn ui-shadow ui-corner-all ui-icon-plus \"></th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+value.seconds+
            "</td></tr>"
          );
        };
        // Small quake, no shading
        if(value.subject < 5){
          $("#quakeTable").append(
            "<tr id=\"smallQuake\"><th id=\"quakeItem\" class=\"ui-shadow-icon ui-btn ui-shadow ui-corner-all ui-icon-plus ui-btn-inline\">MOO</th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+value.seconds+
            "</td></tr>"
          );
        };
    });
  }
  
  // Public method, load and parse the data
  quake.loadData = function(){
    loadJSON();
  };
  
  // Register the quake object to the global namespace
  window.quake = quake;
}(window));