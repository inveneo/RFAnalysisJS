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
  fresnelZoneNumber = typeof fresnelZoneNumber !== 'undefined' ? a : 1; //if fresnelZoneNumber not specified, = 1
  
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
  console.log("Link object created");
}

// @param point is length from left to right in meters
// @return height from the point of the fresnel zone
Link.prototype.getFresnelZoneHeightAtPoint = function(point)
{
  var dist1M = point;
  console.log("dist1M = " + dist1M);
  var dist2M = ((this.linkLength * 1000 ) - dist1M);
  //console.log("dist1M + dist2M = " +  (dist1M + dist2M));
  console.log("dist2M = " + dist2M);
  console.log("Math.sqrt(( "+this.fresnelZoneNumber+" * "+this.lambda+ " * " + dist1M + " * " + dist2M+' )/( ' +dist1M +" + " + dist2M+"))");
  var fresnelZone = Math.sqrt((this.fresnelZoneNumber*this.lambda*dist1M*dist2M)/(dist1M+dist2M));
  console.log("fresnelZone = " + fresnelZone);
  console.log("Height of Fresnel Zone at "+dist1M+" meters is "+fresnelZone.toFixed(2));
  return fresnelZone.toFixed(2);
};

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
  console.log("Distance is "+d+" Km");
  this.linkLength = d;
}

Link.prototype.elevationAnalysis = function (elevationArray)
{
	//create x axis array based on number of elevation points
  var arrayX= [];
  for(i=0; i<elevationArray.length; i++)
  {
    arrayX.push(i);
  }
  
  //setting paper
  var elevationGraphPaper = Raphael("elevationGraphPaper", 1020, 1560);

  var lineOfSite1 = elevationArray[0] + this.t1;
  var lineOfSite2 = elevationArray[elevationArray.length-1]+this.t2;
  console.log("lineOfSite1="+lineOfSite1+" | lineOfSite2="+lineOfSite2);
  var lines = elevationGraphPaper.linechart(20, 20, 900, 420, [arrayX,[arrayX[0],arrayX[arrayX.length-1]]], [elevationArray,[lineOfSite1,lineOfSite2]], { nostroke: false, symbol: "circle", axis: "0 0 1 1", smooth: true }).hoverColumn(function () {
      this.tags = elevationGraphPaper.set();

      for (var i = 0, ii = this.y.length; i < ii; i++) {
          this.tags.push(elevationGraphPaper.tag(this.x, this.y[i], this.values[i], 10, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));
      }
  }, function () {
      this.tags && this.tags.remove();
  });
  
  var beginPoint = lines.lines[0].getPointAtLength(0,0);
  var endPoint =  lines.lines[0].getPointAtLength(lines.lines[0].getTotalLength());
  console.log(beginPoint);
  console.log(endPoint);
  
  lines.symbols.attr({ r: 3 });
  lines.lines[1].animate({"stroke-width": 4}, 1000);
  // lines.symbols[0].attr({stroke: "#fff"});
  
  //create red dot at first and last point
  lines.symbols[0][0].animate({fill: "#f00"}, 1000);
  lines.symbols[0][arrayX.length-1].animate({fill: "#f00"}, 1000);
  
  var lineOfSiteLine = lines.lines[1];
  var lineOfSiteDrawingLength = lineOfSiteLine.getTotalLength();
  
  var fresnelPath = this.getFresnelPath(lineOfSiteDrawingLength,beginPoint,endPoint);
  var fresnelShape = elevationGraphPaper.path(fresnelPath);
  fresnelShape.attr({fill:"#ff6633", opacity:0.7});
  //add ellipse to the line
  
  var centerPoint = lineOfSiteLine.getPointAtLength(lineOfSiteDrawingLength/2);
  var lineBBox = lineOfSiteLine.getBBox();
  console.log(lineBBox);
  
  
  var retEllipse = elevationGraphPaper.ellipse(centerPoint.x,centerPoint.y,lineOfSiteDrawingLength/2,50);
  var x1 = beginPoint.x;
  var y1 = beginPoint.y;
  var x2 = endPoint.x;
  var y2 = endPoint.y;
  var ellipseAngle = Raphael.angle(x1,y1,x2,y2);
  console.log("ellipse angle is = " + ellipseAngle);
  retEllipse.attr({fill:"#aaa", opacity:0.3});
  retEllipse.rotate(ellipseAngle);
  retEllipse.toBack();
}

Link.prototype.getFresnelPath = function (lineOfSiteDrawingLength,beginPoint,endPoint) 
{
	//var pathString = "M" +beginPoint.x + "," +beginPoint.y;
	var pathString = "M150 600";
	var numberOfSegments = 20;
	var lengthPerSegmentD = lineOfSiteDrawingLength/numberOfSegments;
	var linkLengthM = this.linkLength*1000;
	var lengthPerSegmentM = lengthPerSegmentD*linkLengthM/lineOfSiteDrawingLength;
	
	for(i=1; i<=numberOfSegments; i++)
	{
		
		var xChangeDrawing = (lengthPerSegmentD*i);
		var xChangeM = lengthPerSegmentM*i;
		var yChangeM = this.getFresnelZoneHeightAtPoint(xChangeM);
		var yChangeDrawing = yChangeM*lineOfSiteDrawingLength/linkLengthM;
		pathString += "L"+ xChangeDrawing + " " + yChangeDrawing ;
	}
	pathString += "Z";
	console.log(pathString);
	return pathString;
}

Link.prototype.setLambda = function(freq)
{
	console.log("freq = " + freq);
	this.lambda = 299792458 / ( freq * Math.pow(10, 9));
	console.log("lambda = " + this.lambda);
}
function toRad(value) {
    /** Converts numeric degrees to radians */
    return value * Math.PI / 180;
}

function calcPoints(d,r) {
	return Math.floor(d/(r/1000));
}
