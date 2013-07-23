$(function() {
  
  //just for the slider stuff
  $( "#slider" ).slider({min:1, max:30, value:15,animate:"fast"});
  var sliderVal = $( "#slider" ).slider( "option", "value" );
  var pointsVal = sliderVal*10;
  $("#num-points").html("Number of elevation data points are " + pointsVal);
  $( "#slider" ).on( "slide", function( event, ui ) {
      sliderVal = $( "#slider" ).slider( "option", "value" );
      pointsVal = sliderVal*10;
    $("#num-points").html("Number of elevation data points are " + pointsVal);
   
    
  } );
  $("#latlong").on('submit', function (e) { e.preventDefault(); });
  
  
  //tower height sliders
  $( "#first-tower" ).slider({min:0, max:100, value:0});
  firstTowerHeight = $( "#first-tower" ).slider( "option", "value" );
  $("#first-tower-label").html("First tower is " + firstTowerHeight);
  $( "#first-tower" ).on( "slide", function( event, ui ) { 
    firstTowerHeight = $( "#first-tower" ).slider( "option", "value" );
     $("#first-tower-label").html("First tower is " + firstTowerHeight);
  });
  
  $( "#second-tower" ).slider({min:0, max:100, value:0});
  secondTowerHeight = $( "#second-tower" ).slider( "option", "value" );
  $("#second-tower-label").html("Second tower is " + secondTowerHeight);
  $( "#second-tower" ).on( "slide", function( event, ui ) { 
    secondTowerHeight = $( "#second-tower" ).slider( "option", "value" );
     $("#second-tower-label").html("Second tower is " + secondTowerHeight);
  });
  
  
  
  $('#submit-lat-long').click(function(){
    createRfAnalysis(pointsVal,firstTowerHeight,secondTowerHeight);
  });
});

function createRfAnalysis(dataPointsInt,tHeight1,tHeight2)
{
  var lat1 = $("#lat1").val();
  var long1 = $("#long1").val();
  var lat2 = $("#lat2").val();
  var long2 = $("#long2").val();
  var frequency = $("#radio-freq").val();
  
  var currentLink = new Link(lat1,long1,lat2,long2,frequency,tHeight1,tHeight2);
  var elevationDataArray = getElevationDataArray(lat1,long1,lat2,long2,dataPointsInt,currentLink);
}

function getElevationDataArray(lat1,long1,lat2,long2,dataPointsInt,currentLink)
{
	var queryString = "http://maps.googleapis.com/maps/api/elevation/json?path=" + lat1+","+long1+"|"+lat2+","+long2+"&samples="+dataPointsInt+"&sensor=false";
	var elevationArray=[];
	var googleRetObj = $.getJSON( queryString, function(data) {
  
        dataResults = data.results;
        for(i=0; i<dataResults.length;i++)
        {
          elevationArray.push(dataResults[i].elevation);
        }
      })
      .done(function() { 
      currentLink.elevationAnalysis(elevationArray);
       })
      .fail(function() { })
      .always(function() { });
      
	
}
  
