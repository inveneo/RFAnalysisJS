RFAnalysisJS
=====================

##### A JavaScript library to assist with radio frequency (RF) link planning

### Overview

Wireless link planning, or more specifically assessing the viability of a wireless link such as a Wi-Fi or UHF/VHF radio link between two locations can be a complex task.  Designing these links, particularly long links or links greater than 10 Km, can be challenging, as there are many factors that must be accounted for to ensure high quality transmission.  Specifically, it can be difficult to assess concerns such as the existence of intrusions into the line of sight path between two points.

This JavaScript library is an effort to streamline and simplify the wireless link planning process.  It focuses on two key areas of wireless link planning.  It provides 1) Fresnel Zone intrusion analsysis of a point-to-point wireless link, and 2) a 360° viewshed analysis around a single point.

### Elevation API
This project uses [Google's Elevation API](https://developers.google.com/maps/documentation/elevation/).  Note that while Google maintains a free public facing API, Google enforces daily usage limits – currently 2,500 calls per day.  If you have a Google Maps API for Business account, the daily call limit is significantly higher.  See below on how to configure the library with your key.

In addition, note Google's terms of service state that the  Elevation API may only be used in conjunction when displaying results on a Google map.  Using elevation data without displaying the results on a map for which elevation data was requested is prohibited.

Note, this library is only able to factor in intrusions of terrain (the surface of the earth) into the Fresnel Zone.  The underlying data does not account for buildings, trees, or other potential obstructions.

#### Note on Daily API Call Limits

##### Point-Point Link Analysis

Using this library to perform point-point link analysis is relativley lightweight in terms of calls to Google's API.  The library will make one call each time the page is loaded or refreshed.

##### Viewshed Analysis

Using this library to perform Viewshed analysis is considerably more expensive in terms of the number of calls to Google's API.  The library performs a series of calls based on the precision variable.  To perform a quick viewshed analysis of lesser quality, set the resolution variable to something such as 30 (or 30°).  The library will then make 12 calls to Google's API (360/30=12).  To perform a high quality viewshed analysis, set the resolution variable to something like 1.  The library will then make 360 calls to Google's API (360/1=360).  Note that at high precision, you may quickly exhaust Google's daily API limit of 2,500 calls.  

### Dependencies

This project requires:

 * Raphael.js
 * D3.js
 * jQuery

While not a dependency to use RFAnalysisJS, [CoffeeScript](http://coffeescript.org/) is required to recompile the JavaScript for the viewshed analysis.

### Usage

#### Point-Point Link Analysis

See reference code in elevation-analysis.html.

Usage:

* Enter the coordinates (decimal format) of two locations
* Enter the radio frequency (GHz)
* Select the number of points you wish to calculate along the path - note Google's Elevation API allows for a maximum of 512 points
* Adjust the height (meters) of each location

The resulting image shows the path between the two points with the first Fresnel zone.

##### Example of Point-Point Link Analysis

![Point-Point Link Analysis](https://dl.dropboxusercontent.com/u/100305526/permanent/rf-analysis/p2p.png "Point-Point Link Analysis")

#### Viewshed Analysis

See the sample code in elevation-analysis.html.  Note the JavaScript for viewshed analysis is compiled from CoffeeScript.

Green indicates clear line of sight from the center point, red indicates no clear line of sight.

If you *do not* hava a Google Maps API for Business account, the call to the maps API should look like this:
```javascript
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=geometry"></script>
```

If you *do* have a Google Maps API for Business account, retrieve your client ID from your console and insert it into the HTML as such:
```javascript
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=geometry&client=CLIENT-ID"></script>
```

Variables to set in the HTML file:

```javascript
var lat = 37.852357; // latitude of center point
var lng = -122.483139; // longitude of center point
var frequency = 5800; // frequency of radio
var aboveGroundHeight = 5; // meters above ground
var distance = 10000; // radius of viewshed in meters    
var precision = 30; // resolution (degrees)

##### Example of Viewshed Analysis

```
![Viewshed Analysis](https://dl.dropboxusercontent.com/u/100305526/permanent/rf-analysis/viewshed.png "Point-Viewshed Analysis")

###  Google Maps API for Business account

To be documented

### Future Work
* Redo the Point-Point Link Analysis to use D3 instead of Raphael.js
* Merge the Point-Point Link Analysis with the Viewshed Analysis
* Cache Google's elevation data on the Viewshed Analysis so when you zoom in, we can grab the elevation values and redraw without another API call
* Put this in some kind of package management system and break up the files in a more modular way to develop with
* Highlight intrusions into the Fresnel zone in Point-Point Link Analysis
* Allow for a variable tolerance (intrusion) level in the Viewshed Analysis -- e.g. a slider might permit the user to adjust for intrusions ranging from 0 to 100%, which would then alter the resulting viewshed.  Typically one might allow for intrusions of up to 40% (or 60% unobstructed) in the first Fresnel zone.


### References

4Gon Solutions maintains a good introduction and overview to [Fresnel Zones](http://www.4gon.co.uk/solutions/technical_fresnel_zones.php).

### Contributors

* [Matt Crum](https://github.com/mattcrum)
* [Clark Ritchie](https://github.com/clarkritchie)