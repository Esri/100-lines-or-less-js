require(["esri/map","esri/dijit/LocateButton","esri/dijit/Scalebar",
  "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js", "dojo/domReady!"], 
  function(Map, LocateButton, Scalebar, BootstrapMap) {
    var mapLocations = [[[-116.563947,33.7716325], 9, "Palm Springs",
                         "http://www.esri.com/events/devsummit/get-involved/code-challenge"],
        [[-1.6884545,48.1159155],10, "Rennes","http://www.tourisme-rennes.com/en/home.aspx"],
        [[-2.0066529,48.6462819],10, "Saint Malo","http://www.saint-malo-tourisme.co.uk/"],
        [[-3.460182,48.81232],10, "Perros Guirec","http://www.perros-guirec.fr/home_tourism"],
        [[-4.4996006,48.408408],10, "Brest","http://www.brest-metropole-tourisme.fr/en/"],
        [[-4.0972104,47.9981276],10, "Quimper","http://www.quimper-tourisme.com/en.html"],
        [[-3.3803144,47.749325],10, "Lorient", "http://www.lorient-tourisme.fr/index.cfm?lng=en"]];
    
    var index = 0, currentPt = new esri.geometry.Point(mapLocations[0][0]);
    var nextPt = new esri.geometry.Point(mapLocations[1][0]); //init  
   
    var map = new Map("mapDiv", { basemap:"national-geographic", center:currentPt, zoom:9}); //Map 
    map.on("load", updateBasemapUI);
    map.on("basemap-change", updateBasemapUI);
    map.on("click", updateInfo);
    setBoussole(currentPt, nextPt);   
  
    geoLocate = new LocateButton({map: map, highlightLocation:true}, "LocateButton"); 
    geoLocate.startup();
    
    if(navigator.geolocation ){  
        navigator.geolocation.getCurrentPosition(getPosition, locationError);} 
       
   var markerSymbol = new esri.symbol.PictureMarkerSymbol(
		   										"images/apple-touch-icon-iphone.png", 20, 20);
   BootstrapMap.bindTo(map);
  
    // Functions UI
    function updateBasemapUI () {
      $("#navbar li").removeClass("active").
        filter("[data-basemap='" + $("#mapDiv")[0].dataset.basemap + "']").addClass("active");}
     
    function nextMap(startUp) { 
         showBasemap(index);}

    function setBasemap(basemapType) {
    	map.setBasemap(basemapType);}
    
    function updateInfo(){
 	   showBasemap(index = index === mapLocations.length - 1 ? 0 : index + 1); // change area
        var nextIndex = index === mapLocations.length - 1 ? 0 : index +1;
        nextPt = new esri.geometry.Point(mapLocations[nextIndex][0]);  
        setBoussole(currentPt,nextPt);
    }
    
    function showBasemap(index) { // set map and location
    	currentPt = new esri.geometry.Point(mapLocations[index][0]);
    	var graphic = new esri.Graphic(currentPt,markerSymbol);
    	map.graphics.add(graphic);
    	map.centerAndZoom(currentPt,mapLocations[index][1]);
    	document.getElementById("townName").innerHTML= 'Town name : '+ mapLocations[index][2];
    	document.getElementById("townNameXs").innerHTML= 'Town name : '+ mapLocations[index][2];
    	document.getElementById("site").href=mapLocations[index][3];
    	document.getElementById("siteXs").href=mapLocations[index][3];
    	document.getElementById("imgSite").src="images/" + index +".jpg";}
    
    function setBoussole(pointOri, pointDest){ // set position and direction
    	if (pointOri.getLatitude()>pointDest.getLatitude()){
        	angle= 180+(Math.atan((pointDest.getLongitude() - pointOri.getLongitude()) /
        			(pointDest.getLatitude() - pointOri.getLatitude())) * 180/Math.PI);
        }else{
        	 angle= (Math.atan((pointDest.getLongitude() - pointOri.getLongitude()) / 
        			 (pointDest.getLatitude() - pointOri.getLatitude())) * 180/Math.PI);}    
        $("#test").css("transform", "rotate("+angle+"deg");
        document.getElementById("dist").innerHTML= 'Distance to next location :'
        	+  Math.round(esri.geometry.getLength(pointOri,pointDest) * 100) + ' kms';
        document.getElementById("distXs").innerHTML= 'Distance to next location :'
        	+  Math.round(esri.geometry.getLength(pointOri,pointDest) * 100) + ' kms';}
       
    function getPosition(location) {
    	currentPt = new esri.geometry.Point(location.coords.longitude, location.coords.latitude); 
    	map.centerAndZoom(currentPt, 9);
        setBoussole(currentPt,nextPt);}
      
   function locationError(error) {
          if(navigator.geolocation ) {  //error occurred so stop watchPosition
            navigator.geolocation.clearWatch(watchId);}}
   
    
    $(document).ready(function() {
      $("#navbar li").click(function(e) {
       var basemapType = e.target.parentElement.dataset.basemap;
        setBasemap(basemapType); 
        });    
      $("#boussoleButon").click(function(){
    	  updateInfo();
       });
      $("#LocateButton").click(function(){
    	  geoLocate.locate();
    	  currentPt = map.position;
          setBoussole(currentPt,nextPt);
      });
  });
});