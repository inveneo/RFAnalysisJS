/*
* This file is part of RFAnalysisJS.
* 
* RFAnalysisJS is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* RFAnalysisJS is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with RFAnalysisJS.  If not, see <http://www.gnu.org/licenses/>.
*/

var constants = {
   'speed_of_light': 299792458, // meters per second
   'earth_radius': 8504
};

/* 
Link generates a Link object
@params x1,y1 is the x and y coordinates of the first point
@params x2,y2 is the x and y coordinates of the second point
@param frequency is the radio frequency in GHz
@param t1 is height of the first point above the terrain (ie. tower height)
@param t2 is the height of the second point above terrain (ie. tower height)
@param elevationDataArray is an array of elevations in meters
*/
function Link(x1,y1,x2,y2,frequency,t1,t2,fresnelZoneNumber) 
{
  fresnelZoneNumber = typeof fresnelZoneNumber !== 'undefined' ? fresnelZoneNumber : 1; //if fresnelZoneNumber not specified, = 1
  
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.frequency = frequency;
  this.t1 = t1; //agl - above ground level
  this.t2 = t2;
  this.fresnelZoneNumber = fresnelZoneNumber;
  this.linkLength = 0;
  this.setLinkLength(x1,y1,x2,y2);
  this.setLambda(frequency);

}

// @param point is length from left to right in meters
// @return height from the point of the fresnel zone
Link.prototype.getFresnelZoneHeightAtPoint = function(point)
{
  var dist1M = point;
  var dist2M = ((this.linkLength * 1000 ) - dist1M);
  //console.log("d1 = "+dist1M + " | d2 = " + dist2M + " | d = "+this.linkLength*1000 + " | lambda = "+this.lambda)
  var fresnelZone = Math.sqrt((this.fresnelZoneNumber*this.lambda*dist1M*dist2M)/(dist1M+dist2M));
  return fresnelZone.toFixed(2);
}

//Sets linkLength property of Link
Link.prototype.setLinkLength = function (x1,y1,x2,y2)
{
  //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
  var R = 6371; // Radius of earth in Km 
  var dx = toRad(this.x2-this.x1);
  var dy = toRad(this.y2-this.y1); 
  var a = Math.sin(dx/2) * Math.sin(dx/2) +
          Math.cos(toRad(this.x1)) * Math.cos(toRad(this.x2)) * 
          Math.sin(dy/2) * Math.sin(dy/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  this.linkLength = d;
}

Link.prototype.elevationAnalysis = function (elevationObj)
{
	//create array to be used in the linechart function
  var elevationArray = [];
  var elevationLatArray = [];
  var elevationLngArray = [];
  for(i=0; i<elevationObj.length; i++)
  {
	  elevationArray.push(elevationObj[i].elevation);
	  elevationLatArray.push(elevationObj[i].location.lat());
	  elevationLngArray.push(elevationObj[i].location.lng());
  }

	//create x axis array based on number of elevation points
  var arrayX= [];
  for(i=0; i<elevationArray.length; i++)
  {
    arrayX.push(i);
  }
  
  //setting paper
  var elevationGraphPaper = Raphael("elevationGraphPaper", 1560,1020 );
  
  
  var lineOfSite1 = elevationArray[0] + this.t1;
  var lineOfSite2 = elevationArray[elevationArray.length-1]+this.t2;
  var lineOfSiteArrayX = [];
  var lineOfSiteArrayY = [];
  var lineOfSiteChangeY = 0;
  lineOfSiteChangeY=(lineOfSite2-lineOfSite1)/elevationArray.length;
  /*
  if(lineOfSite2>=lineOfSite1){

  	lineOfSiteChangeY=(lineOfSite2-lineOfSite1)/elevationArray.length;
  }
  else{
	  lineOfSiteChangeY=(lineOfSite2-lineOfSite1)/elevationArray.length;
  }
*/

  for(i=0; i<elevationArray.length;i++)
  {
	  lineOfSiteArrayX[i]= i;
	  lineOfSiteArrayX[i]= i;
	  lineOfSiteArrayY[i]= lineOfSite1+ lineOfSiteChangeY*i;
  }
  
  var heightReferenceLineMin = Math.min.apply(Math,elevationArray);
  var heightReferenceLineMax = getHeightOfGraphInMeters(elevationArray)+heightReferenceLineMin;

  var lines = elevationGraphPaper.linechart(20, 20, 1200, 300, [arrayX,lineOfSiteArrayX,[0,0]], [elevationArray,lineOfSiteArrayY,[heightReferenceLineMin,heightReferenceLineMax]], { nostroke: false, symbol: "circle", axis: "0 0 1 1", smooth: true }).hoverColumn(function () {
      this.tags = elevationGraphPaper.set();
      for (var i = 0, ii = this.y.length; i < ii; i++) {
          this.tags.push(elevationGraphPaper.tag(this.x, this.y[i], this.values[i]+" | Lat: "+elevationLatArray[this.axis]+" | Lng: "+elevationLngArray[this.axis], 10, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));
      }
  }, function () {
      this.tags && this.tags.remove();
  });
  
  var beginPoint = lines.lines[0].getPointAtLength(0,0);
  var endPoint =  lines.lines[0].getPointAtLength(lines.lines[0].getTotalLength());
  
  lines.symbols.attr({ r: 1 });
  lines.lines[1].attr({"stroke": 0});
  
  //create red dot at first and last point
  lines.symbols[0][0].animate({fill: "#f00"}, 1000);
  lines.symbols[0][arrayX.length-1].animate({fill: "#f00"}, 1000);
  
  var lineOfSiteLine = lines.lines[1];
  var lineOfSitePointBegin = lineOfSiteLine.getPointAtLength(0,0);
  var lineOfSitePointEnd =  lineOfSiteLine.getPointAtLength(lineOfSiteLine.getTotalLength());
  var lineOfSiteDrawingLength = lineOfSiteLine.getTotalLength();
  
  var lineOfSiteDrawingHeight = 0;
  
	refBbox = lines.lines[0].getBBox();
	
  var fresnelAngle = Raphael.angle(lineOfSitePointBegin.x,lineOfSitePointBegin.y,lineOfSitePointEnd.x,lineOfSitePointEnd.y);
  
  //!!!! NOTE:  Object.keys(elevationObj).length MAY ONLY WORK IN Chrome, IE 9+, FF 4+, or Safari 5+ !!!!!
  var resolution = Object.keys(elevationObj).length;
  var fresnelValues = this.getFresnelValues(lineOfSiteDrawingLength,refBbox.height,lineOfSitePointBegin,lineOfSitePointEnd,resolution,elevationArray,lineOfSiteArrayY);
  
  var fresnelShape = elevationGraphPaper.path(fresnelValues.path);
  fresnelShape.attr({fill:"#ff6633", opacity:0.5, stroke:0});
  var shapeBeginPoint = fresnelShape.getPointAtLength(0);
  var translateX=shapeBeginPoint.x-lineOfSitePointBegin.x;
  var translateY = shapeBeginPoint.y-lineOfSitePointBegin.y;
  //fresnelShape.transform("t"+translateX+","+translateY+"r"+fresnelAngle);
  fresnelShape.transform("r"+(fresnelAngle+180)+","+shapeBeginPoint.x+","+shapeBeginPoint.y+"T"+lineOfSitePointBegin.x+","+lineOfSitePointBegin.y);
  
  //This line is a reference line that i dont want visible.  It allows me to properly scale the y-axis
  lines.lines[2].attr({stroke: 0, fill: "none"});

  var intersections = Raphael.pathIntersection(lines.lines[0],fresnelValues.path);
	 
	intersections.forEach(function(co) {
	  elevationGraphPaper.circle(co.x, co.y, 10).attr({stroke: 'none', fill: '#333'})
	})
	  
  lines.hoverColumn(function(){
  	/* !!!!! THIS IS NEED TO BE REMOVED SO THAT NO JQUERY IS REQUIRED IN THE LIBRARY  !!!!!!!!!!!  */
  	var currentFresnelZone = fresnelValues.data[this.axis].fresnel;
	  $("#fresnel-zone-data").html("Lat: "+elevationLatArray[this.axis]+" | Lng: "+elevationLngArray[this.axis]+" <br /> Fresnel Value at "+((fresnelValues.data[this.axis].distance)*.001).toFixed(2)+"km is "+currentFresnelZone + "m <br /> Percent of fresnel intrusion is " + fresnelValues.data[this.axis].percentIntruded);
  });
  
}


/*
Returns an object containing and svg path at attribute "path, and values of "length" and "fresnel" calc for each point
returned object: ObjectName: {path: <SVGPATH>, 0: {distance: <DIST>, fresnel: <FRESNEL_LENGTH>, 1: {distance: <DIST>, fresnel: <FRESNEL_LENGTH>, ...etc
*/
Link.prototype.getFresnelValues = function (lineOfSiteDrawingLength,lineOfSiteDrawingHeight,beginPoint,endPoint,resolution,elevationArray,lineOfSiteArray)
{
	var pathString = "M 0 0 ";
	
	/*
var lineOfSiteHeightM = 0;
	if(elevationArray[0] < elevationArray[elevationArray.length-1])
	{
		lineOfSiteHeightM = elevationArray[elevationArray.length-1] - elevationArray[0];
	}
	else
	{
		lineOfSiteHeightM =  elevationArray[0] - elevationArray[elevationArray.length-1];
	}
*/
	var heightOfGraphM = Math.max.apply(Math,elevationArray)-Math.min.apply(Math,elevationArray);
	var fresnelValObj = {};
	fresnelValObj.data = {};
	var numberOfSegments = resolution;
	var lengthPerSegmentD = lineOfSiteDrawingLength/numberOfSegments;
	var linkLengthM = this.linkLength*1000;
	var lengthPerSegmentM = lengthPerSegmentD*linkLengthM/lineOfSiteDrawingLength;
    //console.log("lengthPerSegmentM = "+ lengthPerSegmentM)
	for(i=0; i<numberOfSegments; i++)
	{
		var xChangeDrawing = lengthPerSegmentD*i;
		var xChangeM = lengthPerSegmentM*i;
        //console.log("xChangeM = " +xChangeM + " | linkLengthM = "+linkLengthM)
		var yChangeM = this.getFresnelZoneHeightAtPoint(xChangeM);
		var yChangeDrawing = yChangeM * lineOfSiteDrawingHeight/heightOfGraphM;
		fresnelValObj.data[i] = {};
		fresnelValObj.data[i].fresnel=yChangeM;
		fresnelValObj.data[i].distance=xChangeM;
		fresnelValObj.data[i].percentIntruded=getFresnelClearance(yChangeM,lineOfSiteArray[i],elevationArray[i]);
		//fresnelValObj.data[i].percentClear= getPercentClear(losLine;
		pathString += "L "+ (xChangeDrawing) + " " + (yChangeDrawing)+" " ;
	}
	
	//to get mirror y values to draw
	for(i=numberOfSegments; i>=0; i--)
	{
		var j = numberOfSegments*2-i;
		var xChangeDrawing = lengthPerSegmentD*i;
		var xChangeM = lengthPerSegmentM*i;
		var yChangeM = this.getFresnelZoneHeightAtPoint(xChangeM);
		var yChangeDrawing = yChangeM*lineOfSiteDrawingHeight/heightOfGraphM;

        if(yChangeDrawing !== 0)
        {
            pathString += "L " + (xChangeDrawing)+ " " + "-"+(yChangeDrawing)+" " ;
        }
		else
        {
            pathString += "L " + (xChangeDrawing)+ " "+(yChangeDrawing)+" " ;
        }
	}
	
	pathString +=" Z";
    //console.log(pathString);
	fresnelValObj.path=pathString;
	return fresnelValObj;
}

function getHeightOfGraphInMeters(elevationArray)
{
	return ((Math.max.apply(Math,elevationArray)) - (Math.min.apply(Math,elevationArray)));
}

function getFresnelClearance(fresnel,losPoint,elevPoint)
{
	var fresnelRadius = fresnel/2;
	var fresnelPercent = 0;
	if (elevPoint > (losPoint-fresnelRadius))
	{
		//how many meters over line of sight point
		var a = elevPoint-(losPoint-fresnelRadius);
		 
		fresnelPercent = a/fresnel*100;
		
		if (fresnelPercent>100){fresnelPercent=100;}
	}
	return fresnelPercent;
}

Link.prototype.setLambda = function(freq)
{
	this.lambda = 299792458 / ( freq * Math.pow(10, 9));
}
function toRad(value) {
    /** Converts numeric degrees to radians */
    return value * Math.PI / 180;
}

function calcPoints(d,r) {
	return Math.floor(d/(r/1000));
}
