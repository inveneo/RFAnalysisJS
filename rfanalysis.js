/*
 * This libray uses a variety of calculations for latitude/longitude points
 * (c) Chris Veness 2002-2012 available at:  http://www.movable-type.co.uk/scripts/latlong.html
 */
var constants = {
   'speed_of_light': 299792458, // meters per second
   'earth_radius': 8504,
   'earth_radius_miles': 3958.75,
   'deg2rad': 0.01745329252, // Factor to convert decimal degrees to radians
   'rad2deg': 57.29577951308 // Factor to convert decimal degrees to radians
};

(function (rfanalysis) {
    // Your library comes here
		console.log("rfanalysis constructor immediate function");
}(this.rfanalysis = this.rfanalysis || {}));

// example from: http://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-a-url
function calcFresnelZone(linkLengthKm,dist1M,frequencyGHz,clearZonePercent,fresnelZoneNumber,success) {
	var dist2M = ((linkLengthKm * 1000 ) - dist1M);
	var midPoint = linkLengthKm / 2;
	console.log("Link Length: "+linkLengthKm+" Km");
	console.log("D1: "+dist1M+" M");
	console.log("D2: "+dist2M+" M");
	console.log("Frequency: "+frequencyGHz+" GHz");
	console.log("Clear Zone: "+clearZonePercent+"%");
	console.log("Zone number: "+fresnelZoneNumber);
	
	var lambda = constants.speed_of_light / ( frequencyGHz * Math.pow(10, 9));
	console.log("Lambda: "+lambda);
	
	var fresnelZone = Math.sqrt((fresnelZoneNumber*lambda*dist1M*dist2M)/(dist1M+dist2M));
	console.log("Height of Fresnel Zone at "+dist1M+" meters is "+fresnelZone.toFixed(2));
	
	var maxCurvatureAllowance = getCurvatureAllowance(linkLengthKm);
	console.log("Max curviture allowance at "+midPoint.toFixed(2)+" Km is "+maxCurvatureAllowance.toFixed(2));
}

function getCurvatureAllowance(dKm) {
	return (1000*Math.pow(dKm, 2))/(constants.earth_radius * 8);
}

function calcDistance(lat1,lon1,lat2,lon2,success) {
    //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
    var R = 6371; // Radius of earth in Km 
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    console.log("Distance is "+d+" Km");
    return d;
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

function calcPoints(d,r) {
	return Math.floor(d/(r/1000));
}

function calcOffset(distance,resolution) {
	var n = calcPoints(distance,resolution);
	var maxCurvatureAllowance = getCurvatureAllowance(distance);
	var midPoint = n / 2;
	var curveAtPoint = maxCurvatureAllowance / midPoint;
	var l = 0;
	
	
	console.log("maxCurvatureAllowance is "+maxCurvatureAllowance);
	console.log("N is "+n);
	console.log("midPoint is "+midPoint);
	var curveAt = 0;
	console.log("curveAtPoint is "+curveAtPoint);
	
	var offset = new Array(n);
	for (var i=0;i<=n;i++) {
		if (i>0) {
			if (i<=midPoint) {
				curveAt+=curveAtPoint;
			} else {
				curveAt-=curveAtPoint;
			}
		}
		
		// better solution for this?  to get around a tiny
		// floating point remainder on last iteration
		if (i==n) {
			curveAt=0;
		}
		
		offset[i]=curveAt;
		console.log("Curviture at point "+i+" and "+l+"m is "+curveAt);
		l+=resolution;
	}
	
	console.log(offset);
}


function gc(lat1,lon1,bearing,distance) {
	// Convert to radians
	lat1 = lat1 * constants.deg2rad;
	lon1 = lon1 * constants.deg2rad;
	bearing = bearing * constants.deg2rad;
	
	// Convert arc distance to radians
	c = distance / constants.earth_radius_miles;
	
	y2 = Math.asin( Math.sin(lon1) * Math.cos(c) + Math.cos(lon1) * Math.sin(c) * Math.cos(bearing)) * constants.rad2deg;
	
	a = Math.sin(c) * Math.sin(bearing);
	b = Math.cos(lon1) * Math.cos(c) - Math.sin(lon1) * Math.sin(c) * Math.cos(bearing);
	
	if( b == 0 )
		x2 = lat1;
	else
		x2 = lat1 + Math.atan(a/b) * constants.rad2deg;
	
	console.log("Starting at ("+lat1.toFixed(5)+","+x2.toFixed(5)+") at bearing "+bearing+" degrees, distance "+distance+", Ending at ("+x2.toFixed(5)+","+y2.toFixed(5)+")");
	//console.log("X2="+x2+", Y2="+y2);
	// return x2,y2;
}

/*
function d(lat1,lon1,bearing,d) {
	// Convert to radians
	//lat1 = lat1 * constants.deg2rad;
	//lon1 = lon1 * constants.deg2rad;
	//bearing = bearing * constants.deg2rad;
	
	R = constants.earth_radius_miles;
//	R = constants.earth_radius;
	var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(bearing) );
	var lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(d/R)*Math.cos(lat1), Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
	lat2 = lat2 * constants.deg2rad;
	lon2 = lon2 * constants.deg2rad;
//	lat2 = lat2 * constants.rad2deg;
//	lon2 = lon2 * constants.rad2deg;
	console.log("Starting at ("+lat1.toFixed(5)+","+lon1.toFixed(5)+") at bearing "+bearing+" degrees, distance "+d+", Ending at ("+lat2.toFixed(5)+","+lon2.toFixed(5)+")");	
}
*/

// from: http://www.movable-type.co.uk/scripts/latlong.html
function orthoDestCalc(lat1,lon1,bearing,dist) {
    var p1 = new LatLon(lat1, lon1);
    var p2 = p1.destinationPoint(bearing, dist);
    var bearingFinal = p1.finalBearingTo(p2);
    // 'dms' or 'd'
	console.log(p2.toString('dms'),",name");
    // console.log("Starting at ("+lat1.toFixed(5)+","+lon1.toFixed(5)+") at bearing "+bearing+" degrees, distance "+d+", Ending at "+p2.toString('dms'));	
  }

function calcPointsOnGreatCircle(lat1,lon1,stepBy,d) {
	// you can validate that these GPS points do indeed form a circle around the
	// center (lat1,lon1) by copying/pasting this console.log output (and the
	// output in the orthoDestCalc function) into http://www.gpsvisualizer.com/map_input?form=google
	console.log("latitude,longitude,name");
	for (var n=0; n<=360;n+=stepBy) {
		orthoDestCalc(lat1,lon1,n,d);
	}
}