
###
RFAnalysisJS is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

RFAnalysisJS is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with RFAnalysisJS.  If not, see <http://www.gnu.org/licenses/>.
###
  
class window.RFAnalysisViewshed
  self = []
  constructor: ->
    @results = {}
    self = this
    window.self = this
    @constants = {earthRadius: 6378137}
  createSite: (lat, lng, radioFrequency, aboveGroundHeight,distance,precision) ->
    mySite =  new Site(lat, lng, radioFrequency, aboveGroundHeight,distance,precision)
    @results.sites ?= []
    @results.sites.push mySite
    return mySite


  class Site
    constructor: (@lat, @lng, @radioFrequency, @aboveGroundHeight) ->
      @setLambda()

    createViewshed: (distance,precision) =>
      myViewshed = new Viewshed(this,distance,precision)
      self.results.sites.viewshed = myViewshed
      return myViewshed

    createViewshedBusiness: (distance,precision,googleClientId,urlToSignKey) =>
      myViewshed = new Viewshed(this,distance,precision,googleClientId,urlToSignKey)
      self.results.sites.viewshed = myViewshed
      return myViewshed

    setLambda: () ->
      @lambda = 299792458 / ( @radioFrequency * Math.pow(10, 9))

    class Viewshed
      constructor: (@_site,@distance,@precision,@googleClientId,@urlToSignKey) ->
        if  @googleClientId? and @urlToSignKey?
          this.createViewshedBusiness(@googleClientId,@urlToSignKey)
        else
          this.createViewshed()
      createCirclesPoints: =>
        segmentLengthM = @distance / (360 / @precision)
        originLngLat = [@_site.lng, @_site.lat]
        totalArray = []
        originArray = []
        i = 0
        while i <= 360 / @precision
          originArray[i] = originLngLat
          i++
        totalArray.push originArray
        oneCircle = new d3.geo.circle().precision(@precision).origin((x, y) ->[x, y])
        i = 1
        while i <= 360 / @precision
          oneCircle.angle @getAngle(i * segmentLengthM)
          totalArray.push oneCircle(originLngLat[0], originLngLat[1]).coordinates[0]
          i++
        return totalArray
      getAngle: (circleRadius) =>
        return (180/Math.PI * circleRadius) / window.self.constants.earthRadius
      preparePolygons: (totalArray) =>
        retGeoJson =
          type: "FeatureCollection"
          features: []

        refArray = []
        i = 0
        while i < totalArray.length
          j = 0
          while j < totalArray.length
            polygon = []
            if i isnt totalArray.length - 1 and j isnt totalArray.length - 1
              instanceId = retGeoJson.features.length
              polygon.push [totalArray[i][j], totalArray[i][j + 1], totalArray[i + 1][j + 1], totalArray[i + 1][j], totalArray[i][j]]
              refArray.push i + "." + j + " | " + i + "." + (j + 1) + " | " + (i + 1) + "." + (j + 1) + " | " + (i + 1) + "." + j

              centroid = d3.geo.centroid(
                type: "Polygon"
                coordinates: polygon
              )
              retGeoJson.features[retGeoJson.features.length] =
                type: "Feature"
                id: instanceId
                properties:
                  line_id: j
                  circle_id: i
                  id: instanceId
                  centroid: [d3.round(centroid[0], 7), d3.round(centroid[1], 7)]
                  polyID: retGeoJson.features.length

                geometry:
                  type: "Polygon"
                  coordinates: polygon
            j++
          i++
        return retGeoJson
      changeColor: (id,color,geoJson) ->
        geoJson.features[id].properties.color=color
        return geoJson
      linkAnalysis: (elevations) ->
        lineOfSiteArray = []
        lineOfSiteSegment = (elevations[elevations.length - 1] - elevations[0]) / elevations.length
        returnMessage = 1
        i = 0
        while i < elevations.length
          if i is 0
            lineOfSiteArray[i] = elevations[0] + 2
          else
            lineOfSiteArray[i] = elevations[0] + 2 + lineOfSiteSegment * (i + 1)
            returnMessage = 0  if lineOfSiteArray[i] < elevations[i]
          i++
        returnMessage
      getCentroids: (featureCollection) ->
        centroids = []
        for aFeature of featureCollection.features
          centroids[featureCollection.features[aFeature].id] =
            coordinates: featureCollection.features[aFeature].properties.centroid
            line_id: featureCollection.features[aFeature].properties.line_id
            circle_id: featureCollection.features[aFeature].properties.circle_id
            id: featureCollection.features[aFeature].properties.id
        centroidsNest = d3.nest().key((d) ->
          d.line_id
        ).entries(centroids)
        centroidsNest
      coordinatesToArray: (geoJson, maxCoordsRequest) ->
        googleCoordArray = []
        polygonsIterator = 0
        arrayIterator = 0
        while polygonsIterator < geoJson.features.length
          googleCoordArray[arrayIterator] = []  if typeof googleCoordArray[arrayIterator] is "undefined"
          googleCoordArray[arrayIterator].push [geoJson.features[polygonsIterator].properties.centroid[1], geoJson.features[polygonsIterator].properties.centroid[0]]

          arrayIterator++  if googleCoordArray[arrayIterator].length is maxCoordsRequest
          polygonsIterator++
        googleCoordArray
      createRequestUrlBusiness: (latLngArray,clientId,pathToSignedKeyCreator)->
        requestStringBase = "http://maps.googleapis.com"
        requestString = "http://maps.googleapis.com/maps/api/elevation/json?locations="
        i = 0

        while i < latLngArray.length
          requestString += latLngArray[i][0] + "," + latLngArray[i][1]
          requestString += "|"  if i < (latLngArray.length - 1)
          i++
        requestString += "&client=" + clientId + "&sensor=false"
        return $.post(pathToSignedKeyCreator, {"url-to-sign": requestString, "base-url": requestStringBase},(finalString) -> return finalString)
      createRequestUrl: (latLngArray)->
        requestStringBase = "http://maps.googleapis.com"
        requestString = "http://maps.googleapis.com/maps/api/elevation/json?locations="
        i = 0

        while i < latLngArray.length
          requestString += latLngArray[i][0] + "," + latLngArray[i][1]
          requestString += "|"  if i < (latLngArray.length - 1)
          i++
        requestString += "&sensor=false"
        return requestString
      ajaxRetry: (myurl, limit) ->
        $.ajax
          url: myurl
          type: "POST"
          tryCount: 0
          async: true
          retryLimit: limit
          success: (json) ->
            if json is "null" or typeof json is "undefined" or json is ""
              json="THIS IS A FAILURE!!!!"
              console.log("failllllure -------------------------")
            return json
          error: (xhr, textStatus, errorThrown) ->
            if textStatus is "timeout"
              @tryCount++
              if @tryCount <= @retryLimit
                #try again
                $.ajax this
                return
              return
            if xhr.status is 500
              return "500 error. :("
            else
              return errorThrown
      setElevation: (geoJson, elevJson) ->
        elevationArray = []
        nestedElements = @getCentroids(geoJson)
        elevationArray = elevJson
        i = 0

        while i < elevationArray.length
          geoJson.features[i].properties.elevation = elevationArray[i].elevation
          i++
        propertiesArray = []
        i = 0
        while i < geoJson.features.length
          propertiesArray.push geoJson.features[i].properties
          i++
        elevationNest = d3.nest().key((d) ->
          d.line_id
        ).entries(propertiesArray)
        i = 0
        while i < elevationNest.length
          tempArray = []
          j = 0
          while j < elevationNest[i].values.length
            polygonID = elevationNest[i].values[j].id
            tempArray.push elevationNest[i].values[j].elevation
            if @linkAnalysis(tempArray)
              geoJson = @changeColor(polygonID, "#00ff00", geoJson)
            else
              geoJson = @changeColor(polygonID, "#ff0000", geoJson)
            j++
          i++
        return geoJson
      createViewshedBusiness:(googleBusinessId,pathToSignedKeyCreator) =>
        google.maps.visualRefresh = true
        $map = $('#map')
        map = new google.maps.Map($map[0], zoom: 11,mapTypeId: google.maps.MapTypeId.TERRAIN,center: new google.maps.LatLng(@_site.lat,@_site.lng))
        thisSite = this
        overlay = new google.maps.OverlayView()
        polygonsGeoJson = {}
        overlay.onAdd= ->
          layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay")
          svg = layer.append("svg")
          adminDivisions2 = svg.append("g").attr("class", "AdminDivisions2")

          overlay.draw= ->
            markerOverlay = this
            overlayProjection = markerOverlay.getProjection()

            #Turn the overlay projection into a d3 projection
            googleMapProjection= (coordinates) ->
              googleCoordinates = new google.maps.LatLng(coordinates[1],coordinates[0])
              pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates)
              return [pixelCoordinates.x+4000, pixelCoordinates.y + 4000]

            path = d3.geo.path().projection(googleMapProjection)
            totalArray = thisSite.createCirclesPoints()
            polygonsGeoJson = thisSite.preparePolygons(totalArray)
            coordArray = thisSite.coordinatesToArray(polygonsGeoJson, 60)
            jxhr = []
            result = []
            requestUrlArray = $.map coordArray, (val,j)->
              return thisSite.createRequestUrlBusiness(val,googleBusinessId,pathToSignedKeyCreator)
            $.when.apply($, requestUrlArray).done ->
              $.each coordArray, (i,subArray) ->
                #window.console.log(this)

                jxhr.push(thisSite.ajaxRetry(requestUrlArray[i].responseText,3).done( (json)=> result.push(json.results) ) )
              $.when.apply($, jxhr).done =>
                sortedCoordArray = []
                i = 0
                while i < result.length
                  j = 0
                  while j < coordArray.length
                    if coordArray[i][0][0] is result[j][0].location.lat
                      sortedCoordArray.push result[j]
                      break
                    j++
                  i++
                elevationObject = []
                $.each sortedCoordArray, (i,data)=>
                  $.merge(elevationObject,data)
                elevation = thisSite.setElevation(polygonsGeoJson,elevationObject)

                drawing = adminDivisions2.selectAll("path")
                .data(elevation.features)

                drawingAttr = drawing
                .attr("d", path)
                .enter().append("svg:path")
                .style("fill",(d)->return d.properties.color)
                .style("stroke",(d)->return d.properties.color)
                .attr("d", path)
        overlay.setMap(map)
        return polygonsGeoJson
      createViewshed: =>
        google.maps.visualRefresh = true
        $map = $('#map')
        map = new google.maps.Map($map[0], zoom: 11,mapTypeId: google.maps.MapTypeId.TERRAIN,center: new google.maps.LatLng(@_site.lat,@_site.lng))
        thisSite = this
        overlay = new google.maps.OverlayView()
        polygonsGeoJson = {}
        overlay.onAdd= ->
          layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay")
          svg = layer.append("svg")
          adminDivisions2 = svg.append("g").attr("class", "AdminDivisions2")

          overlay.draw= ->
            markerOverlay = this
            overlayProjection = markerOverlay.getProjection()

            #Turn the overlay projection into a d3 projection
            googleMapProjection= (coordinates) ->
              googleCoordinates = new google.maps.LatLng(coordinates[1],coordinates[0])
              pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates)
              return [pixelCoordinates.x+4000, pixelCoordinates.y + 4000]

            path = d3.geo.path().projection(googleMapProjection)
            totalArray = thisSite.createCirclesPoints()
            polygonsGeoJson = thisSite.preparePolygons(totalArray)
            coordArray = thisSite.coordinatesToArray(polygonsGeoJson, 40)
            jxhr = []
            result = []
            requestUrlArray = $.map coordArray, (val,j)->
              return thisSite.createRequestUrl(val)
            $.when.apply($, requestUrlArray).done ->
              $.each coordArray, (i,subArray) ->
                jxhr.push(thisSite.ajaxRetry(requestUrlArray[i],3).done( (json)=> result.push(json.results) ) )
              $.when.apply($, jxhr).done =>
                sortedCoordArray = []
                i = 0
                while i < result.length
                  j = 0
                  while j < coordArray.length
                    if coordArray[i][0][0] is result[j][0].location.lat
                      sortedCoordArray.push result[j]
                      break
                    j++
                  i++
                elevationObject = []
                $.each sortedCoordArray, (i,data)=>
                  $.merge(elevationObject,data)
                elevation = thisSite.setElevation(polygonsGeoJson,elevationObject)


                drawing = adminDivisions2.selectAll("path")
                .data(elevation.features)

                drawingAttr = drawing
                .attr("d", path)
                .enter().append("svg:path")
                .style("fill",(d)->return d.properties.color)
                .style("stroke",(d)->return d.properties.color)
                .attr("d", path)
        overlay.setMap(map)
        return polygonsGeoJson