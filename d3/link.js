var constants = {
   'speed_of_light': 299792458, // meters per second
   'earth_radius': 6378137 //expressed in meters
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
  console.log("Link is " + this.linkLength + "m");
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

// @param point is length from left to right in meters
// @return height from the point of the fresnel zone
Link.prototype.getFresnelZoneHeightAtPoint = function(point)
{
  var dist1M = point;
  //console.log("dist1M = " + dist1M);
  var dist2M = this.linkLength - dist1M;
  //var dist2M = ((this.linkLength) - dist1M);
  //console.log("dist1M + dist2M = " +  (dist1M + dist2M));
  //console.log("dist2M = " + dist2M);
  //console.log("Math.sqrt(( "+this.fresnelZoneNumber+" * "+this.lambda+ " * " + dist1M + " * " + dist2M+' )/( ' +dist1M +" + " + dist2M+"))");
  var fresnelZone = Math.sqrt((this.fresnelZoneNumber*this.lambda*dist1M*dist2M)/(dist1M+dist2M));
  //console.log("fresnelZone = " + fresnelZone);
  //console.log("Height of Fresnel Zone at "+dist1M+" meters is "+fresnelZone.toFixed(2));
  return fresnelZone.toFixed(2);
};

function createCirclesPoints(radius, precision, originLngLat)
{
  var segmentLengthM = radius/(360/precision);
  var totalArray = [];
  var originArray = [];
  
  //set origin as index 0 in totalArray
  for (i=0; i<=360/precision; i++)
  {
      originArray[i] = originLngLat;
  }

  totalArray.push(originArray);
  var oneCircle = new d3.geo.circle().precision(precision).origin(function(x,y){ return [x,y];});
  for (i=1; i<=360/precision; i++)
  {
    oneCircle.angle(getAngle(i*segmentLengthM));
    totalArray.push(oneCircle(originLngLat[0],originLngLat[1]).coordinates[0]);
  }

  return totalArray;
}

function getAngle(circleRadius)
{
    return (180/Math.PI * circleRadius)/constants.earth_radius; 
}

function preparePolygons(totalArray)
{
  var retGeoJson = { "type": "FeatureCollection", "features": [] };
  var refArray = [];
  
  for (i=0; i<totalArray.length; i++)
  {
    for (j=0; j<totalArray.length; j++)
    {
      var polygon = [];
      if(i != totalArray.length-1 && j != totalArray.length-1)
      {  
        var instanceId = retGeoJson.features.length;
        
        polygon.push([totalArray[i][j],totalArray[i][j+1],totalArray[i+1][j+1],totalArray[i+1][j],totalArray[i][j]]);
        
        refArray.push(i+"."+j+" | "+i+"."+(j+1)+" | "+(i+1)+"."+(j+1)+" | "+(i+1)+"."+j);
        //console.log(i+"."+j+" | "+i+"."+(j+1)+" | "+(i+1)+"."+(j+1)+" | "+(i+1)+"."+j);
        //console.log(polygon);
        var centroid = d3.geo.centroid({"type":"Polygon", "coordinates": polygon});

        retGeoJson.features[retGeoJson.features.length] = {"type": "Feature", "id":instanceId, 
                                                            "properties": {"line_id":j,
                                                                            "circle_id":i,
                                                                            "id":instanceId,
                                                                            "centroid": [d3.round(centroid[0],13),d3.round(centroid[1],13)],
                                                                            "polyID":retGeoJson.features.length},
                                                                            "geometry": {"type":"Polygon", "coordinates":polygon}};
      }
    }
  }
  //console.log(getCentroids(retGeoJson));
  //var elevation = setElevation(retGeoJson);
  return retGeoJson;
}

function setElevation(geoJson,elevJson)
{
  var latLngCoords = [];
  var elevationArray = [];
  var nestedElements = getCentroids(geoJson);
  var mappedElements = d3.map(nestedElements);
  //console.log(elevJson);

  elevationArray=elevJson;
  //console.log(elevationArray);

  for(var i=0; i<elevationArray.length; i++)
  {
    geoJson.features[i].properties.elevation = elevationArray[i].elevation;
  }

  //console.log(geoJson);
  var propertiesArray= [];
  for(var i=0; i<geoJson.features.length; i++)
  {
    propertiesArray.push(geoJson.features[i].properties);
  }
  //console.log(propertiesArray);
  var elevationNest = d3.nest().key(function(d) { return d.line_id}).entries(propertiesArray);
  //console.log("elevationNest");
  //console.log(elevationNest);
  console.log(elevationNest);
  for(var i=0; i<elevationNest.length;i++)
  {
    var tempArray = [];
    for(var j=0; j<elevationNest[i].values.length; j++)
    {
      var polygonID = elevationNest[i].values[j].id;
      //console.log("j="+j + " | i="+i);
      tempArray.push(elevationNest[i].values[j].elevation);
      //console.log(tempArray);
      if(linkAnalysis(tempArray))
      {
        geoJson = changeColor(polygonID,"#00ff00",geoJson);
      }
      else
      {
        geoJson = changeColor(polygonID,"#ff0000",geoJson);
      }
      
    }
  }
  
  console.log(geoJson);
  return geoJson;
  
}

function changeColor(id, color,geoJson)
{
  geoJson.features[id].properties.color=color;
  return geoJson;
}

function getCentroids(featureCollection)
{
  var centroids = [];
  for(aFeature in featureCollection.features)
  {
    centroids[featureCollection.features[aFeature].id] = {"coordinates":featureCollection.features[aFeature].properties.centroid, 
                                                            "line_id":featureCollection.features[aFeature].properties.line_id, 
                                                            "circle_id":featureCollection.features[aFeature].properties.circle_id,
                                                            "id":featureCollection.features[aFeature].properties.id}
  }
  var centroidsNest = d3.nest().key(function(d) { return d.line_id}).entries(centroids);
  return centroidsNest;
}

function linkAnalysis(elevations)
{
  //console.log(elevations);
  //var elevations = [13,24,12,50,42,104,100];
  var lineOfSiteArray = [];
  var lineOfSiteSegment = (elevations[elevations.length-1] - elevations[0]) / elevations.length;
  // console.log("lineOfSiteSegment = " + lineOfSiteSegment);
  // console.log("end point = " + elevations[elevations.length-1]);
  // console.log("begin point = " + elevations[0]);
  // console.log("number of items" + elevations.length);
  var returnMessage = 1;
  for(i=0; i<elevations.length; i++)
  {
    if(i==0)
    {
      lineOfSiteArray[i]=elevations[0]+2;
    }
    else
    {
      lineOfSiteArray[i]=elevations[0]+2+lineOfSiteSegment*(i+1);

      if(lineOfSiteArray[i]<elevations[i])
      {
        returnMessage = 0;
      }
    }
    
    
  }
  //console.log("elevations");console.log(elevations);
  //console.log("lineOfSiteArray");console.log(lineOfSiteArray);
  // console.log(returnMessage);
  return returnMessage;
}

//returns an array containing arrays of length maxCoordsRequest or less of coordinates arrays
//geojson must contain centroid property
//example return: [ [ coordArray(200) ], [ coordArray(200) ], [ coordArray(137) ] ]
function coordinatesToArray(geoJson, maxCoordsRequest)
{
  var googleCoordArray = [];
  var polygonsIterator = 0;
  var arrayIterator = 0;

  while (polygonsIterator < geoJson.features.length)
  {
      if(typeof googleCoordArray[arrayIterator] == "undefined")
      {
          googleCoordArray[arrayIterator] = [];
      }
      googleCoordArray[arrayIterator].push([geoJson.features[polygonsIterator].properties.centroid[1],geoJson.features[polygonsIterator].properties.centroid[0]]);
      //googleCoordArray[arrayIterator].push(geoJson.features[polygonsIterator].properties.centroid);
      
      if(googleCoordArray[arrayIterator].length == maxCoordsRequest) { arrayIterator++;}
      polygonsIterator++;
  }
  console.log(googleCoordArray);
  return googleCoordArray;
}

function createRequestUrl(latLngArray)
{
    var requestString = "http://maps.googleapis.com/maps/api/elevation/json?locations=";
    for (var i=0; i<latLngArray.length; i++)
    {
        requestString += latLngArray[i][0]+","+latLngArray[i][1];
        if(i<(latLngArray.length-1))
        {
            requestString+="|";
        }
    }
    requestString+= "&sensor=false";
    return requestString;
}

















