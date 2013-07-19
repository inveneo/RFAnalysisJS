var constants = {
   'speed_of_light': 299792458, // meters per second
   'earth_radius': 8504
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