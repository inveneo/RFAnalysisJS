RF-Analysis.js
==============

Google Earth Outreach Program radio frequency analysis project


# RF (Radio Frequency) Link Planner

### Overview

Wireless link planning, or more specifically assessing the viability of a wireless link (such as a Wi-Fi or UHF/VHF radio link) between two locations can be a complex task.  Designing these links, particularly long links or links greater than 10 Km, can be challenging, as there are many factors that must be accounted for to ensure high quality transmission.  Specifically, it can be difficult to assess concerns such as the existence of intrusions into the line of sight path between two points.

This JavaScript library is an effort to streamline and simplify the wireless link planning process.  It focuses on two key areas of wireless link planning providing 1) Fresnel Zone intrusion analsysis of a point-to-point wireless link, and 2) perform 360° viewshed analysis from a single point.

4Gon Solutions maintains a good introduction and overview to [Fresnel Zones](http://www.4gon.co.uk/solutions/technical_fresnel_zones.php).

### Elevation API
This project uses [Google's Elevation API](https://developers.google.com/maps/documentation/elevation/).  Note that while Google maintains a free public facing API, Google enforces daily usage limits – currently 2,500 calls per day.  If you have a Google Maps API for Business account, you have higher limits – simply configure the library with your key.

In addition, note that the Elevation API may only be used in conjunction with displaying results on a Google map; using elevation data without displaying a map for which elevation data was requested is prohibited. 

### Dependencies

This project requires:

 * Raphael.js
 * D3.js
 * jQuery
 * CoffeeScript (in the ViewShed analysis)

And here's some code!

```javascript
$(function(){
  $('div').html('I am a div.');
});
```

### Usage

#### Point-Point Link Analysis


### Future Work
* Redo the Elevation Analysis tool to use D3 instead of Raphaeljs
* Merge the Elevation Analysis tool with the Viewshed tool
* Cache the Google elevation data on the Viewshed tool so when you zoom in, we can grab the elevation values and redraw without hitting Google's servers again
* Put this in some kind of package management system and break up the files in a more modular way to develop with

