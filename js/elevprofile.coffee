Link = (x1, y1, x2, y2, frequency, t1, t2, fresnelZoneNumber) ->
  fresnelZoneNumber = (if typeof fresnelZoneNumber isnt "undefined" then fresnelZoneNumber else 1) #if fresnelZoneNumber not specified, = 1
  @x1 = x1
  @y1 = y1
  @x2 = x2
  @y2 = y2
  @frequency = frequency
  @t1 = t1 #agl - above ground level
  @t2 = t2
  @fresnelZoneNumber = fresnelZoneNumber
  @linkLength = 0
  @setLinkLength x1, y1, x2, y2
  @setLambda frequency
  console.log "Link object created"
  console.log "Link is " + @linkLength + "km"

# @param point is length from left to right in meters
# @return height from the point of the fresnel zone

#console.log("dist1M = " + dist1M);

#var dist2M = ((this.linkLength) - dist1M);
#console.log("dist1M + dist2M = " +  (dist1M + dist2M));
#console.log("dist2M = " + dist2M);
#console.log("Math.sqrt(( "+this.fresnelZoneNumber+" * "+this.lambda+ " * " + dist1M + " * " + dist2M+' )/( ' +dist1M +" + " + dist2M+"))");

#console.log("fresnelZone = " + fresnelZone);
#console.log("Height of Fresnel Zone at "+dist1M+" meters is "+fresnelZone.toFixed(2));

#Sets linkLength property of Link

#Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
# Radius of earth in Km

#create array to be used in the linechart function

#create x axis array based on number of elevation points

#setting paper

#console.log("lineOfSite1="+lineOfSite1+" | lineOfSite2="+lineOfSite2);

#lines.lines[1].animate({"stroke-width": 4}, 1000);

# lines.symbols[0].attr({stroke: "#fff"});

#create red dot at first and last point

#!!!! NOTE:  Object.keys(elevationObj).length MAY ONLY WORK IN Chrome, IE 9+, FF 4+, or Safari 5+ !!!!!

#fresnelShape.transform("t"+translateX+","+translateY+"r"+fresnelAngle);

#This line is a reference line that i dont want visible.  It allows me to properly scale the y-axis

# !!!!! THIS IS NEED TO BE REMOVED SO THAT NO JQUERY IS REQUIRED IN THE LIBRARY  !!!!!!!!!!!

#
#Returns an object containing and svg path at attribute "path, and values of "length" and "fresnel" calc for each point
#returned object: ObjectName: {path: <SVGPATH>, 0: {distance: <DIST>, fresnel: <FRESNEL_LENGTH>, 1: {distance: <DIST>, fresnel: <FRESNEL_LENGTH>, ...etc
#

#
#var lineOfSiteHeightM = 0;
#	if(elevationArray[0] < elevationArray[elevationArray.length-1])
#	{
#		lineOfSiteHeightM = elevationArray[elevationArray.length-1] - elevationArray[0];
#	}
#	else
#	{
#		lineOfSiteHeightM =  elevationArray[0] - elevationArray[elevationArray.length-1];
#	}
#

#console.log("lineOfSiteHeightM = " + lineOfSiteHeightM);

#console.log("elevationArrayRangeM = " + elevationArrayRangeM);

#fresnelValObj.data[i].percentClear= getPercentClear(losLine;

#to get mirror y values to draw
getHeightOfGraphInMeters = (elevationArray) ->
  (Math.max.apply(Math, elevationArray)) - (Math.min.apply(Math, elevationArray))
getFresnelClearance = (fresnel, losPoint, elevPoint) ->
  fresnelRadius = fresnel / 2
  fresnelPercent = 0
  console.log "fresnel=" + fresnel + " | losPoint=" + losPoint + " | elevPoint=" + elevPoint
  if elevPoint > (losPoint - fresnelRadius)

    #how many meters over line of sight point
    a = elevPoint - (losPoint - fresnelRadius)
    fresnelPercent = a / fresnel * 100
    fresnelPercent = 100  if fresnelPercent > 100
  fresnelPercent
toRad = (value) ->

  ###
  Converts numeric degrees to radians
  ###
  value * Math.PI / 180
calcPoints = (d, r) ->
  Math.floor d / (r / 1000)
constants =
  speed_of_light: 299792458
  earth_radius: 8504

Link::getFresnelZoneHeightAtPoint = (point) ->
  dist1M = point
  dist2M = ((@linkLength * 1000) - dist1M)
  fresnelZone = Math.sqrt((@fresnelZoneNumber * @lambda * dist1M * dist2M) / (dist1M + dist2M))
  fresnelZone.toFixed 2

Link::setLinkLength = (x1, y1, x2, y2) ->
  R = 6371
  dx = toRad(@x2 - @x1)
  dy = toRad(@y2 - @y1)
  a = Math.sin(dx / 2) * Math.sin(dx / 2) + Math.cos(toRad(@x1)) * Math.cos(toRad(@x2)) * Math.sin(dy / 2) * Math.sin(dy / 2)
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  d = R * c
  console.log "Distance is " + d + " Km"
  @linkLength = d

Link::elevationAnalysis = (elevationObj) ->
  elevationArray = []
  elevationLatArray = []
  elevationLngArray = []
  i = 0
  while i < elevationObj.length
    elevationArray.push elevationObj[i].elevation
    elevationLatArray.push elevationObj[i].location.lat
    elevationLngArray.push elevationObj[i].location.lng
    i++
  arrayX = []
  i = 0
  while i < elevationArray.length
    arrayX.push i
    i++
  elevationGraphPaper = Raphael("elevationGraphPaper", 1560, 1020)
  lineOfSite1 = elevationArray[0] + @t1
  lineOfSite2 = elevationArray[elevationArray.length - 1] + @t2
  lineOfSiteArrayX = []
  lineOfSiteArrayY = []
  lineOfSiteChangeY = 0
  if lineOfSite2 >= lineOfSite1
    lineOfSiteChangeY = (lineOfSite2 - lineOfSite1) / elevationArray.length
  else
    lineOfSiteChangeY = (lineOfSite1 - lineOfSite2) / elevationArray.length
  console.log "lineOfSiteChangeY = " + lineOfSiteChangeY
  i = 0
  while i < elevationArray.length
    lineOfSiteArrayX[i] = i
    lineOfSiteArrayY[i] = lineOfSite1 + lineOfSiteChangeY * i
    i++
  console.log lineOfSiteArrayX
  heightReferenceLineMin = Math.min.apply(Math, elevationArray)
  heightReferenceLineMax = getHeightOfGraphInMeters(elevationArray) + heightReferenceLineMin
  console.log elevationArray
  console.log "heightReferenceLineMax=" + heightReferenceLineMax
  console.log "heightReferenceLineMin=" + heightReferenceLineMin
  lines = elevationGraphPaper.linechart(20, 20, 1200, 300, [arrayX, lineOfSiteArrayX, [0, 0]], [elevationArray, lineOfSiteArrayY, [heightReferenceLineMin, heightReferenceLineMax]],
    nostroke: false
    symbol: "circle"
    axis: "0 0 1 1"
    smooth: true
  ).hoverColumn(->
    @tags = elevationGraphPaper.set()
    i = 0
    ii = @y.length

    while i < ii
      @tags.push elevationGraphPaper.tag(@x, @y[i], @values[i] + " | Lat: " + elevationLatArray[@axis] + " | Lng: " + elevationLngArray[@axis], 10, 10).insertBefore(this).attr([
        fill: "#fff"
      ,
        fill: @symbols[i].attr("fill")
      ])
      i++
  , ->
    @tags and @tags.remove()
  )
  beginPoint = lines.lines[0].getPointAtLength(0, 0)
  endPoint = lines.lines[0].getPointAtLength(lines.lines[0].getTotalLength())
  console.log beginPoint
  console.log endPoint
  lines.symbols.attr r: 1
  lines.lines[1].attr stroke: 0
  lines.symbols[0][0].animate
    fill: "#f00"
  , 1000
  lines.symbols[0][arrayX.length - 1].animate
    fill: "#f00"
  , 1000
  lineOfSiteLine = lines.lines[1]
  lineOfSitePointBegin = lineOfSiteLine.getPointAtLength(0, 0)
  lineOfSitePointEnd = lineOfSiteLine.getPointAtLength(lineOfSiteLine.getTotalLength())
  lineOfSiteDrawingLength = lineOfSiteLine.getTotalLength()
  lineOfSiteDrawingHeight = 0
  refBbox = lines.lines[0].getBBox()
  console.log "refHeight= " + refBbox.height
  fresnelAngle = Raphael.angle(lineOfSitePointBegin.x, lineOfSitePointBegin.y, lineOfSitePointEnd.x, lineOfSitePointEnd.y)
  resolution = Object.keys(elevationObj).length
  console.log "resolution is " + resolution
  fresnelValues = @getFresnelValues(lineOfSiteDrawingLength, refBbox.height, lineOfSitePointBegin, lineOfSitePointEnd, resolution, elevationArray, lineOfSiteArrayY)
  fresnelShape = elevationGraphPaper.path(fresnelValues.path)
  fresnelShape.attr
    fill: "#ff6633"
    opacity: 0.5
    stroke: 0

  shapeBeginPoint = fresnelShape.getPointAtLength(0)
  translateX = shapeBeginPoint.x - lineOfSitePointBegin.x
  translateY = shapeBeginPoint.y - lineOfSitePointBegin.y
  console.log "translateX = " + (translateX) + " | translateY =" + (translateY)
  fresnelShape.transform "r" + (fresnelAngle + 180) + "," + shapeBeginPoint.x + "," + shapeBeginPoint.y + "T" + lineOfSitePointBegin.x + "," + lineOfSitePointBegin.y
  lines.lines[2].attr
    stroke: 0
    fill: "none"

  console.log "path intersection follows:"
  intersections = Raphael.pathIntersection(lines.lines[0], fresnelValues.path)
  intersections.forEach (co) ->
    elevationGraphPaper.circle(co.x, co.y, 10).attr
      stroke: "none"
      fill: "#333"


  lines.hoverColumn ->
    currentFresnelZone = fresnelValues.data[@axis].fresnel
    $("#fresnel-zone-data").html "Lat: " + elevationLatArray[@axis] + " | Lng: " + elevationLngArray[@axis] + " <br /> Fresnel Value at " + ((fresnelValues.data[@axis].distance) * .001).toFixed(2) + "km is " + currentFresnelZone + "m <br /> Percent of fresnel intrusion is " + fresnelValues.data[@axis].percentIntruded


Link::getFresnelValues = (lineOfSiteDrawingLength, lineOfSiteDrawingHeight, beginPoint, endPoint, resolution, elevationArray, lineOfSiteArray) ->
  pathString = "M 0 0 "
  heightOfGraphM = Math.max.apply(Math, elevationArray)
  fresnelValObj = {}
  fresnelValObj.data = {}
  numberOfSegments = resolution
  lengthPerSegmentD = lineOfSiteDrawingLength / numberOfSegments
  linkLengthM = @linkLength * 1000
  lengthPerSegmentM = lengthPerSegmentD * linkLengthM / lineOfSiteDrawingLength
  i = 0
  while i < numberOfSegments
    xChangeDrawing = lengthPerSegmentD * i
    xChangeM = lengthPerSegmentM * i
    yChangeM = @getFresnelZoneHeightAtPoint(xChangeM)
    yChangeDrawing = yChangeM * lineOfSiteDrawingHeight / heightOfGraphM
    fresnelValObj.data[i] = {}
    fresnelValObj.data[i].fresnel = yChangeM
    fresnelValObj.data[i].distance = xChangeM
    fresnelValObj.data[i].percentIntruded = getFresnelClearance(yChangeM, lineOfSiteArray[i], elevationArray[i])
    pathString += "L " + (xChangeDrawing) + " " + (yChangeDrawing) + " "
    i++
  i = numberOfSegments
  while i >= 0
    j = numberOfSegments * 2 - i
    xChangeDrawing = lengthPerSegmentD * i
    xChangeM = lengthPerSegmentM * i
    yChangeM = @getFresnelZoneHeightAtPoint(xChangeM)
    yChangeDrawing = yChangeM * lineOfSiteDrawingHeight / heightOfGraphM
    pathString += "L " + (xChangeDrawing) + " " + "-" + (yChangeDrawing) + " "
    i--
  pathString += " Z"
  fresnelValObj.path = pathString
  console.log fresnelValObj
  fresnelValObj

Link::setLambda = (freq) ->
  console.log "freq = " + freq
  @lambda = 299792458 / (freq * Math.pow(10, 9))
  console.log "lambda = " + @lambda