google.load('search', '1'); //load google search api version 1
var VAR = {
    querystring: ""
 };
    var map, latitude, longitude, gsvc, pt, imageSearch;	
    require([ "esri/map",  "esri/tasks/GeometryService", "esri/tasks/ProjectParameters",
	"esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on", "esri/dijit/BasemapToggle", "dojo/domReady!" ], 
	function( Map, GeometryService, ProjectParameters, SpatialReference, InfoTemplate, dom, on, BasemapToggle)  
	{ map = new Map("map", { center: [77.2, 28.6], zoom: 3, basemap: "streets"  });  //initialising map    
	map.on("click", myClickHandler);  //map click event
	var toggle = new BasemapToggle({
        map: map,
        basemap: "satellite"
      }, "BasemapToggle");
      toggle.startup();	 // map toggle
	  gsvc = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");	  //geometry service for re-projection
	  function myClickHandler(evt){
						var point = evt.mapPoint;
						var outSR = new SpatialReference(4326);
						//Re-projecting point from Web Mercator to WGS84          
						gsvc.project([ point ], outSR, function(projectedPoints) {  pt = projectedPoints[0];
																					latitude=pt.y.toFixed(3).toString();
																					longitude=pt.x.toFixed(3).toString()
																					getLocationDetails();  //calling getLocationDetails function
																				});	  
								}
		// CORS request for different browsers IE, safari, chrome, etc.						
	 function createCORSRequest(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
               xhr.open(method, url, true);

            } else if (typeof XDomainRequest != "undefined") {
               xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                  xhr = null;
            }
            return xhr;
        }
        //get location details from latitude and longitude
     function getLocationDetails() {           
            var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude + "&sensor=true";
            var xhr = createCORSRequest('POST', url);
            if (!xhr) { alert('CORS not supported on your browser'); }
            xhr.onload = function () {
                var data = JSON.parse(xhr.responseText);
                if (data.results.length > 0) {
				var query="";
                    var locationDetails = data.results[0].formatted_address;
                    var value = locationDetails.split(",");
                    count = value.length;
					for(var i=0;i<value.length;i++)
					{query= query + (value[i].toString()) + " ";
					}
                    VAR.querystring=query;
					imageSearch = new google.search.ImageSearch(); 
					imageSearch.setSearchCompleteCallback(this, searchComplete, null); // on request complete call search complete function
					imageSearch.execute(VAR.querystring);
					google.search.Search.getBranding('branding');
                }

              };
            xhr.send();
        }
	function searchComplete() {
		        if (imageSearch.results && imageSearch.results.length > 0) {
                var results = imageSearch.results;
				document.getElementById("ImageContainer").innerHTML="";
				document.getElementById("ImageContainer").innerHTML = "powered by google";
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var node = result.html.cloneNode(true);                   
                    $('#ImageContainer').append(node);

                }
				}
        }
    });
	
	
