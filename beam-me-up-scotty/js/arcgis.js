require(["esri/map", "esri/dijit/Scalebar", "esri/geometry/webMercatorUtils", "dojo/_base/Color", 
  "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js", "esri/geometry/Circle",
  "esri/graphic", "esri/symbols/PictureMarkerSymbol", "esri/InfoTemplate", "esri/geometry/Point",
  "esri/dijit/LocateButton", "esri/layers/GraphicsLayer", "esri/symbols/SimpleLineSymbol", 
  "esri/symbols/SimpleFillSymbol", "dojo/domReady!"], 
  function(Map, Scalebar, webMercatorUtils, Color, BM, Circle, Graphic, PictureMarkerSymbol, 
    InfoTemplate, Point, LocateButton, GraphicsLayer,  SimpleLineSymbol, SimpleFillSymbol) {
    // Map and variables
    var map = new Map("mapDiv", {basemap: "topo", center: [-116.5381,33.8250], zoom: 16, minZoom: 4, maxZoom: 18}),
      scalebar = new Scalebar({map: map, scalebarUnit: "dual"}), clientID = "7dedae6f0abb4affac4d06c109a134af",
      instagramAPI = "https://api.instagram.com/v1/media/search",
      firebase = new Firebase("https://beammeupscotty.firebaseio.com/"),
      otherScottiesLayer = new GraphicsLayer({id:"other-scotties", opacity: 0.5}),
      redFillColor = new Color([255, 6, 52, 0.1]), greenFillColor = new Color([152, 251, 152, 0.25]),
      $results = $("#results"), $globalResults = $("#global-results"), globalResults = 0,
      geoLocate = new LocateButton({ map: map }, "locate-button");
    map.addLayer(otherScottiesLayer); map.infoWindow.resize(175, 250); geoLocate.startup();
    //Event Binding
    $("#bmus").click(function (e) {
      var geoPoint = createPoint({longitude: getRandomCoordinate(-122,-76), latitude: getRandomCoordinate(47,30)}),
           request = fetchInstagramData(geoPoint);
      drawBeam(geoPoint, greenFillColor, map.graphics); 
      map.centerAndZoom(geoToMerc(geoPoint), 15);
    });
    $("#hard-reset").click(clearAll); firebase.on("child_removed", clearAll); BM.bindTo(map);
    map.on("click", function (e) {
      map.graphics.clear(); //clear own graphics
      var geoPoint = mercToGeo(e.mapPoint),
           request = fetchInstagramData(geoPoint);
      drawBeam(geoPoint, greenFillColor, map.graphics);
    });
    firebase.on("child_added", function (res) {
      var geoPoint = createPoint({longitude: res.val().mapPoint.x, latitude: res.val().mapPoint.y}),
          mapPoint = geoToMerc(geoPoint);
      drawBeam(geoPoint, redFillColor, otherScottiesLayer);
      globalResults += res.val().data.length;
      $globalResults.html(globalResults);
      $.each(res.val().data, function(k, data) { drawThumbnail(data, otherScottiesLayer); });
    });
    function fetchInstagramData(point) {
      $.ajax({
        url: instagramAPI, type: "GET", dataType: "jsonp",
        data: { lat: point.y, lng: point.x, client_id: clientID, distance: 300 }
      }).done(function (res) {
        $results.html(res.data.length);
        if (res.data.length !== 0) {
          var firebaseData = [];
          $.each(res.data, function (key, value) {
            var details = getDetails(value); firebaseData.push(details); 
            drawThumbnail(details, map.graphics); 
          });
          firebase.push({mapPoint: point, data: firebaseData});
        } else { 
          map.graphics.add(new Graphic(point, new PictureMarkerSymbol("http://i57.tinypic.com/vhyh08.png", 50, 50))); 
        }
      }).fail(function (jqXHR, res) { console.log("Request failed: " + res); });
    }
    //Functions
    function getDetails(data) {
      return { 
                username: data.user.username, thumbnailUrl: data.images.thumbnail.url,
                pictureUrl: data.images.standard_resolution.url,
                location: data.location, link: data.link,
                description: (data.caption && data.caption.text) ? data.caption.text : ""
             };
    }
    function createBeam(mapPoint, fillColor) {
      var circleSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                         new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, 
                         new Color([100, 100, 100]), 1), fillColor);
      var circle = new Circle({ center: mapPoint, geodesic: true, radius: 0.2, radiusUnit: "esriMiles" });
      return new Graphic(circle, circleSymbol);
    }
    function drawBeam(point, fillColor, graphicLayer) { graphicLayer.add(createBeam(point, fillColor)); }
    function clearAll() {
      globalResults = 0; $results.empty(); $globalResults.empty(); //clear the badges
      map.infoWindow.hide(); firebase.set(null);  //hide infoWindows and reset bmus.firebase.io
      map.graphics.clear(); otherScottiesLayer.clear(); //clear all graphics
    }
    function createThumbnailGraphic(details) { 
      return new Graphic(createPoint(details.location),
        createPictureMarkerSymbol(details.thumbnailUrl), {}, createInfoTemplate(details)); 
    }
    function drawThumbnail(details, graphicLayer) { graphicLayer.add(createThumbnailGraphic(details)); }
    function mercToGeo(mapPoint) { return webMercatorUtils.webMercatorToGeographic(mapPoint); }
    function geoToMerc(mapPoint) { return webMercatorUtils.geographicToWebMercator(mapPoint); }
    function createPictureMarkerSymbol(imageUrl) { return new PictureMarkerSymbol(imageUrl, 25, 25); }
    function createPoint(location) { 
      return new Point({x: location.longitude, y: location.latitude, spatialReference: { wkid: 4326 }}); 
    }
    function createInfoTemplate(details) { 
      return new InfoTemplate({
        title: "@" + details.username,
        content: "<p><a href='" + details.pictureUrl + "' target='_blank'>"
        + "<img src='"+ details.thumbnailUrl + "'></a><br><b>Description:</b> " + details.description
        + "<br><a href='"+ details.link +"' target='_blank'>Instagram Link</a></p>"
      });
    }
    function getRandomCoordinate(max, min) { return Math.random() * (max - min) + min; }
});