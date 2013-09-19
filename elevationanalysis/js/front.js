$(function() {
  
  
  //just for the slider stuff
  var firstTowerHeight = 0;
  var secondTowerHeight = 0;
  var pointsVal = 0;
  $( "#slider" ).slider({
  	min:10, 
  	max:512, 
  	value:412,
  	range:false,
  	slide: function(event,ui){
  		pointsVal = ui.value;
	  	$("#slider-label").html("Number of elevation data points are " + pointsVal);
		}});
  pointsVal = $( "#slider" ).slider( "option", "value" );
  $("#slider-label").html("Number of elevation data points are " + pointsVal);
  
  
  $("#latlong").on('submit', function (e) { e.preventDefault(); });
  
  
  //tower height sliders
  $( "#first-tower" ).slider({
  	min:0, 
  	max:100, 
  	value:0,
  	range:false,
  	slide: function(event,ui){
  		firstTowerHeight = ui.value;
	  	$("#first-tower-label").html("First tower is " + ui.value);
  	}});
  firstTowerHeight = $( "#first-tower" ).slider( "option", "value" );
  $("#first-tower-label").html("First tower is " + firstTowerHeight);
  $( "#second-tower" ).slider({
  	min:0, 
  	max:100, 
  	value:0,
  	range:false,
  	slide: function(event,ui){
  		secondTowerHeight = ui.value;
	  	$("#second-tower-label").html("Second tower is " + ui.value);
  	}});
  secondTowerHeight = $( "#second-tower" ).slider( "option", "value" );
  $("#second-tower-label").html("Second tower is " + secondTowerHeight);
  
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
  
  var currentLink = new Link(lat1,long1,lat2,long2,frequency,tHeight1,tHeight2,1);
  var elevationDataArray = getElevationDataArray(lat1,long1,lat2,long2,dataPointsInt,currentLink);
}

function getElevationDataArray(lat1,long1,lat2,long2,dataPointsInt,currentLink)
{
	var dataResults ={};
	var queryString = "http://maps.googleapis.com/maps/api/elevation/json?path=" + lat1+","+long1+"|"+lat2+","+long2+"&samples="+dataPointsInt+"&sensor=false";
	var elevationArray={};
	var googleRetObj = $.getJSON( queryString, function(data) {
  
        dataResults = data.results;
      })
      .done(function() { 
      currentLink.elevationAnalysis(dataResults);
       })
      .fail(function() { })
      .always(function() { });
      
	
}

var map;
function initialize() {
  
}

google.maps.event.addDomListener(window, 'load', initialize);
