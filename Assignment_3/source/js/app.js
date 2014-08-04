(function (window){
  // Global variable for use in browser
  var quake = {};
  var editing = false;
  
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
    var displayIndex = 1;
    $.each(quakeArray, function(index,value){
      // Only display present elements
      if(value!==null){
        // Large quake, shade dark red
        if(value.subject >= 7){
          $("#quakeTable").append(
            "<tr class=\"largeQuake\"><th class=\"rowControl\">"+displayIndex+"</th><td id=\""+index+"\"><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
        // Medium quake, shade light red
        if(value.subject >=5){
          $("#quakeTable").append(
            "<tr class=\"mediumQuake\"><th class=\"rowControl\">"+displayIndex+"</th><td id=\""+index+"\"><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
        // Small quake, no shading
        if(value.subject < 5){
          $("#quakeTable").append(
            "<tr class=\"smallQuake\"><th class=\"rowControl\">"+displayIndex+"</th><td id=\""+index+"\"><a href=\""+value.link+"/download/intensity.jpg\" target=\"_blank\">"+value.title+
            "</a></td><td>"+value.lat+" / "+value.long+
            "</td><td>"+(toTime(value.seconds))+
            "</td></tr>"
          );
        };
        displayIndex++;
      }
      // Do nothing if element has been deleted
      if(value===null){
        ;
      }
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
  
  // Public method, edit data
  quake.editData = function(){
    //Toggle editing var
    editing = (!editing);
    
    // User is editing fields
    if(editing){
      $("#editOption").replaceWith("<span style=\"color:red\" id=\"editOption\">EDITING<span>");
      var index = 1;
      $("th.rowControl").each(function(){
        $(this).replaceWith("<th class=\"deleteButton\"><button class=\"ui-btn ui-corner-all ui-icon-delete ui-btn-icon-left\"><span style=\"color:red\">Delete Item "+index+"<span></button></th>");
        index++;
      });
    } 

    // Delete item from list
    $(".deleteButton").click(function(){
      // Get tr to delete
      var contents = $(this).parent();
      // Get index of quake to delete from localStorage
      var quakeToDelete = contents.children("td").attr("id");
      // Delete quake from localStorage
      var quakeData = JSON.parse(localStorage.getItem('quakeData'));
      delete quakeData.quakes[quakeToDelete];
      localStorage.setItem('quakeData', JSON.stringify(quakeData));
      // Remove HTML for deleted quake
      contents.remove();
    });

    // Reset edit menu if done editing
    if(!editing){
      $("#editOption").replaceWith("<span id=\"editOption\">Edit<span>");
      // Reset earthquake numbering
      var index = 1;
      $("th.deleteButton").each(function(){
        $(this).replaceWith("<th class=\"rowControl\">"+index+"</th>");
        index++;
      });
    }
  }
  
  // Register the quake object to the global namespace
  window.quake = quake;
}(window));