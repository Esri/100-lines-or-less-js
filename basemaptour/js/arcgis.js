/* Uses pre-existing library - http://github.com/esri/bootstrap-map-js */
require(["esri/map", "esri/dijit/Scalebar", "esri/dijit/Geocoder", 
  "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js", "dojo/domReady!"], 
  function(Map, Scalebar, Geocoder, BootstrapMap) {
    var mapLocations = [
        ["gray",[-100,45],3], /* World*/ ["streets",[-0.13,51.50],11], // London
        ["hybrid",[151.21,-33.87],14], /* Sydney */ ["topo",[-77.017,38.943],17], // D.C.
        ["national-geographic",[-84.0,10],9], /* Costa Rica */["oceans",[-40,30],4], // Atlantic   
        ["gray",[135,-25],4], /* Australia */ ["streets",[-117.20,32.73],13], // San Diego
        ["hybrid",[-77.65,24.20],9], /* Bahamas */ ["topo",[139.75,35.69],17], // Tokyo
        ["national-geographic",[-74,40.74],12], /* New York */ ["oceans",[-160,30],3] // Pacific
      ];
    var index = Math.floor(Math.random()*mapLocations.length), countDown = 5, sec = countDown, 
        playing = false, played = false, secTimer, firstLoc = mapLocations[index];
    // Map
    var map = new Map("mapDiv", { basemap:firstLoc[0], center:firstLoc[1], zoom:firstLoc[2] });
    map.on("update-end", function() {
      if (playing) nextMap(false);
    });
    map.on("load", updateBasemapUI);
    map.on("basemap-change", updateBasemapUI);
    var scalebar = new Scalebar({ map: map, scalebarUnit: "dual" });
    var geocoder = new Geocoder({ map: map, autoComplete: true }, "search");
    geocoder.startup();
    geocoder.on("select", pauseTour);
    BootstrapMap.bindTo(map);
    // Functions
    function updateBasemapUI () {
      $("#navbar li").removeClass("active").
        filter("[data-basemap='" + $("#mapDiv")[0].dataset.basemap + "']").addClass("active");
    }
    function showCountdown(secondsLeft) {
      secondsLeft===""?$("#start-countdown").hide():$("#start-countdown").show();
      $("#start-countdown").text("" + secondsLeft);
    }
    function resetCountdown() {
      sec = countDown;
      showCountdown(played?sec:"");
    }
    function nextMap(startUp) {
      clearInterval(secTimer);
      if (startUp && !played) {
        played = true;
        showBasemap(index);
      }
      secTimer = setInterval (function() {
        if (--sec == 0) {
          index = (index < (mapLocations.length - 1) ? (index + 1) : 0);
          showBasemap(index);
          resetCountdown();
        }
        showCountdown(sec);
      }, 1000);
    }
    function toggleTour() {
      clearInterval(secTimer);
      $("#start-glyph").toggleClass("glyphicon-pause glyphicon-play"); 
      if (!playing) nextMap(true);
      playing = !playing;
    }
    function pauseTour() {
      if (playing) toggleTour();
    }
    function setBasemap(basemapType) {
      clearInterval(secTimer);
      map.setBasemap(basemapType);
    }
    function showBasemap(index) { // set map and location
      setBasemap(mapLocations[index][0]);
      map.centerAndZoom(mapLocations[index][1],mapLocations[index][2]);
      resetCountdown();
    }
    $(document).ready(function() {
      $("#navbar li").click(function(e) {
        pauseTour();
        var basemapType = e.target.parentElement.dataset.basemap;
        setBasemap(basemapType); // Set the basemap
        index = $("#navbar li").index($("#navbar li[data-basemap='" + basemapType +"']"));
        if ($(".navbar-collapse.in").length > 0) { // Hide if showing responsive menu
          $(".navbar-toggle").click();
        }
      });
      $("#start").click(toggleTour);
      $("#forward").click(function(){
        showBasemap(index = index === mapLocations.length - 1 ? 0 : index + 1);
      });
      $("#backward").click(function(){
        showBasemap(index = index === 0 ? mapLocations.length - 1 : index - 1);
      });
  });
});