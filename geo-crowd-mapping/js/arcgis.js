require([
  "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js",
  "esri/map",
  "esri/layers/GraphicsLayer",
  "esri/graphic",
  "esri/geometry/jsonUtils",
  "esri/geometry/webMercatorUtils",
  "esri/dijit/LocateButton",
  "esri/dijit/LayerSwipe",
  "esri/dijit/Scalebar",
  "esri/toolbars/draw",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color",
  "dojo/domReady!" ],
  function(BootstrapMap, Map, GraphicsLayer, Graphic, jsonUtils, webMercatorUtils, LocateButton, LayerSwipe, Scalebar,
  Draw, PictureMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color) {
    // Map, variables and widgets
    var map = new Map("mapDiv", { basemap: "topo", center: [-116.5381, 33.8250], zoom: 16, minZoom: 4, maxZoom: 18 }),
      scalebar = new Scalebar({ map: map, scalebarUnit: "dual" }),
      geoLocate = new LocateButton({ map: map }, "locate-button"),
      firebase = new Firebase("https://geocrowdmapping.firebaseio.com/"),
      publicLayer = new GraphicsLayer({ id:"public-layer", opacity: 0.75 }),
      redColor = new Color([255, 0, 56, 0.50]),
      blueColor = new Color([17, 80, 147, 0.50]),
      drawToolbar = new Draw(map),
      drawType = "",
      swipeWidget = new LayerSwipe({
        type: "horizontal",
        map: map,
        layers: [publicLayer]
      }, "swipeDiv");

    map.addLayer(publicLayer);
    geoLocate.startup();
    swipeWidget.startup();
    BootstrapMap.bindTo(map);
    drawToolbar.markerSymbol = createPictureMarkerSymbol(); //change default marker symbol
    
    //Event Binding
    firebase.on("child_added", function (res) {
      var graphic = getGraphic(jsonUtils.fromJson(res.val()), "public");
      publicLayer.add(graphic);
    });

    drawToolbar.on("draw-end", function (e) {
      var graphic = getGraphic(e.geometry, "private");
      map.graphics.add(graphic);
      firebase.push(e.geometry.toJson());
    });

    $(".toolbar-btn").click(function (e) {
      var type = $(e.target).data("type");
      drawType = (drawType !== type) ? type : "";
      if(drawType === "") {
        $(e.target).toggleClass("btn-success");
        drawToolbar.deactivate();
      } else {
        $(".btn").removeClass("btn-success");
        $(e.target).toggleClass("btn-success");
        drawToolbar.activate(Draw[type]);
      }
    });
    
    $(".clear").click(function (e) {
      if(confirm("Clear edits in private layer?")) {
        map.graphics.clear();
      }
    });

    //Helper functions
    function getGraphic (geometry, mode) {
      var symbol = (mode === "public") ? getSymbol(geometry.type, blueColor) : getSymbol(geometry.type, redColor);
      return new Graphic(geometry, symbol);
    }

    function getSymbol (geometryType, color) {
      if (geometryType === "polyline") {
        return createSimpleLineSymbol(color);
      } else if (geometryType === "point" || geometryType === "multipoint") {
        return createPictureMarkerSymbol();
      } else {
        return createSimpleFillSymbol(color);
      }
    }

    function createSimpleLineSymbol (color) {
      return new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, color, 2);
    }

    function createSimpleFillSymbol (color) {
      return new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, createSimpleLineSymbol(color), color);
    }

    function createPictureMarkerSymbol () {
      return new PictureMarkerSymbol("img/point.png", 40, 40);
    }
});
