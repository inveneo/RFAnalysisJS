var constants = {
   'speed_of_light': 299792458, // meters per second
   'earth_radius': 6378135 //expressed in meters
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
  this.setLinkLength(lat1,lng1,lat2,lng2);
  this.setLambda(frequency);
  console.log("Link object created");
  console.log("Link is " + this.linkLength + "km");
}

Link.prototype.setLinkLength = function (lat1,lng1,lat2,lng2)
{
  var distanceRadians = d3.geo.distance([lng1,lat1],[lng2,lat2]);
  var distanceMeters = constants.earth_radius*distanceRadians;
  return distanceMeters;
}

Link.prototype.setLambda = function(freq)
{
  console.log("freq = " + freq);
  this.lambda = 299792458 / ( freq * Math.pow(10, 9));
  console.log("lambda = " + this.lambda);
}

function createCirclesPoints(radius, precision, originLngLat)
{
  var segmentLengthM = distance/(360/precision);
  var totalArray = [];
  var multipointCircle = [];
  multipointCircle.coordinates = [];
  multipointCircle.coordinates[0] = [];
  var originArray = [];
  
  //set origin as index 0 in totalArray
  for (i=0; i<=360/precision; i++)
  {
      originArray[i] = originLngLat;
  }

  totalArray.push(originArray);
  for (i=1; i<=360/precision; i++)
  {
    var oneCircle = new d3.geo.circle().angle(getAngle(i*segmentLengthM)).precision(precision).origin(function(x,y){ return [x,y];}); 
        
    totalArray.push(oneCircle(originLngLat[0],originLngLat[1]).coordinates[0]);

    multipointCircle.coordinates[0] = multipointCircle.coordinates[0].concat(oneCircle(originLngLat[0],originLngLat[1]).coordinates[0]);
  }

  return totalArray;

}