(function (window){
  // Global variable for use in browser
  var quake = {};
  
  // Load the data into the HTML.
  // Use cached data if appropriate.
  // Refresh the data if over 1 hour old,
  //   of if a forced refresh is requested.
  function loadData(){
    // Data is good, write to HTML
    if(dataIsFresh()){
      displayQuakes();
    }
    // Data is old/forced refresh, reload and write to HTML
    if(!dataIsFresh()){
      loadJSON();  
    }
  }
  
  // Load the JSON object of most recent quakes using YQL Url
  // Data comes from an XML feed from the USGS of earthquakes in the
  //   past 30 days.
  function loadJSON(){
    var newObj = {};
    var http_req = new XMLHttpRequest();
    http_req.onreadystatechange  = function(){
      if (http_req.readyState === 4){
        hasData = true;

        // Javascript function JSON.parse to parse JSON data
        newObj = JSON.parse(http_req.responseText);

        // Store data locally
        storeData(newObj);

        // Display data in HTML
        displayQuakes();
      }
    };
    http_req.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Fearthquake.usgs.gov%2Fearthquakes%2Fshakemap%2Frss.xml%22&format=json&diagnostics=true&callback=", true);
    http_req.send();
  }
  
  // Store data in localStorage
  function storeData(newData){
    var quakeData = {};
    quakeData.quakes = newData.query.results.item;
    var today = new Date();
    quakeData.timestamp = today.getHours();
    localStorage.setItem('quakeData', JSON.stringify(quakeData));
  }
  
  // Check for age of data
  function dataIsFresh(){
    var isFresh = false;
    // First visit to site, or forced refresh
    if(!window.localStorage.getItem('quakeData')){
      isFresh = false;
    }
    // Not first visit to site, check for fresh data (by hour)
    if(window.localStorage.getItem('quakeData')){
      var quakeData = JSON.parse(localStorage.getItem('quakeData'));  
      var now = new Date();
      // Data is from most recent hour, do not refresh
      if(now.getHours() === quakeData.timestamp){
        isFresh = true;
      }
      // Data is not from most recent hour, refresh
      if(now.getHours() !== quakeData.timestamp){
        window.localStorage.clear();
        isFresh = false;
      }
    }
    return isFresh;
  }
  
  // Output the quakes as a list
  function displayQuakes(){
    var quakeData = JSON.parse(localStorage.getItem('quakeData'));
    var quakeArray = quakeData.quakes;
    
    // Clear table, in case of forced refresh
    $("tbody#quakeTable").replaceWith("<tbody id=\"quakeTable\"></tbody>");
    // Write data to HTML
    $.each(quakeArray, function(index,value){
        // Large quake, shade dark red
        if(value.subject >= 7){
          $("#quakeTable").append(
            "<tr class=\"largeQuake\"><th class=\"rowControl\"></th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
        // Medium quake, shade light red
        if(value.subject >=5){
          $("#quakeTable").append(
            "<tr class=\"mediumQuake\"><th class=\"rowControl\"></th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
        // Small quake, no shading
        if(value.subject < 5){
          $("#quakeTable").append(
            "<tr class=\"smallQuake\"><th class=\"rowControl\"></th><td><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
    });
  }
  
  // Convert from UNIX Time to human readable format
  function toTime(newTime){
    var timeString = "";
    // Convert to milliseconds for use in Javascript Date Object
    var quakeTime = new Date(newTime*1000);
    timeString = quakeTime.toString();
    timeString = timeString.substring(0,timeString.length-15);
    return timeString;
  }
  
  // Public method, load/parse/display the data
  quake.loadData = function(){
    loadData();
  };
  
  // Public method, force data refresh
  quake.forceDataRefresh = function(){
    // Clear local storage
    window.localStorage.clear();
    window.location.reload();
  }
  
  // Register the quake object to the global namespace
  window.quake = quake;
}(window));