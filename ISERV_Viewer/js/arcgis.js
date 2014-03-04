var map, lyrOpacityFlag, theImage, mil, iconlayer, nextIndex;
require(["esri/map", "esri/dijit/BasemapToggle", "esri/layers/MapImageLayer", "esri/layers/MapImage"
    ,"esri/geometry/Extent","esri/SpatialReference","dijit/form/HorizontalSlider","esri/dijit/Popup",
        "esri/dijit/PopupTemplate", "dojo/domReady!"],
    function (Map, BasemapToggle, Popup, PopupTemplate, dom, on, parser, ready) {
        map = new Map("map", { center: [-89, 10], zoom: 3, basemap: "topo" });
        var toggle = new BasemapToggle({ map: map, basemap: "satellite" }, "BasemapToggle");
        toggle.startup();
        iconlayer = new esri.layers.GraphicsLayer();
        mil = new esri.layers.MapImageLayer();
        map.addLayer(mil);
        AddImage(3901502.456128, -1870696.918164, 3923322.831518, -1849667.534159, '1.png');
        AddImage(-9681779.793953, 4084464.249489, -9657210.471269, 4109707.831313, '2.png');
        AddImage(-11787934.058859, 4590359.944748, -11762671.059242, 4616485.119939, '3.png');
        AddImage(-8390298.499823, 4838223.882072, -8362584.852032, 4867362.614902, '4.png');
        AddImage(-13052438.975308, 3840644.067959, -13028142.265796, 3865052.895345, '5.png');
        AddImage(-9861727.954269, 1482863.343913, -9838378.064428, 1504215.967888, '6.png');
        AddImage(586837.394485, 5756551.433855, 614258.033259, 5787175.244654, '7.png');
        AddImage(11686673.688679, 2221452.608327, 11708750.057893, 2242834.669357, '8.png');
        AddImage(9937184.014455, 3274787.531706, 9960202.696492, 3297776.978506, '9.png');
        AddImage(-7980433.729840, -1564762.601321, -7959108.928618, -1544135.098798, '10.png');
        AddImage(9595738.689578, 3218881.087547, 9618966.099158, 3241841.340859, '11.png');
        AddImage(4337194.440358, -705166.511542, 4358756.203225, -684723.609897, '12.png');
        var slider = new dijit.form.HorizontalSlider({
            name: "slider", value: 1, minimum: .1, maximum: 1,
            intermediateChanges: true, style: "width:300px;", onChange: function(value){mil.setOpacity(value);}
        }, "slider");
        var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
        window.addEventListener(orientationEvent, function () {orientationChanged();}, false);
        lyrOpacityFlag = false;
        removeDynMapListener();
        function orientationChanged() {if (map) {map.reposition();map.resize();}}
        function removeDynMapListener() {
            if (window.DeviceMotionEvent) {
                var threshhold = 20;
                var xPTA, yPTA, zPTA, xPostTA, yPostTA, zPostTA = 0;
                window.addEventListener('devicemotion', function (e) {xPTA = e.acceleration.x;
                    yPTA = e.acceleration.y;zPTA = e.acceleration.z;});
                setInterval(function () {var change = Math.abs(xPTA - xPostTA + yPTA - yPostTA + zPTA - zPostTA);
                    if (change > threshhold) { fullextent() }
                    xPostTA = xPTA;yPostTA = yPTA; zPostTA = zPTA; }, 150);
            } else {alert("DeviceMotion is currently not supported on this hardware.");}} });
function onClick(e) {
    theImage = e.graphic;
        map.centerAndZoom(new esri.geometry.Point(e.graphic.geometry.x + 10000,
           e.graphic.geometry.y + 10000, new esri.SpatialReference({ wkid: 102100 })), 12);
        }
function AddImage(xmin, ymin, xmax, ymax, href) {
    var geometrya = new esri.geometry.Point(xmin, ymin, new esri.SpatialReference({ wkid: 102100 }));
    iconlayer.add(new esri.Graphic(geometrya,
        new esri.symbol.PictureMarkerSymbol("images/marker.png", 45, 45)));
    map.addLayer(iconlayer);dojo.connect(iconlayer, "onClick", onClick);
    var mi = new esri.layers.MapImage({
        'extent': new esri.geometry.Extent({"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, 
            "spatialReference": { "wkid": 102100 } }), 'href': 'images/'+href });
    mil.addImage(mi);if(!theImage){ theImage = iconlayer.graphics[0]; }}
    $(function () {
        $("#imageSwipe").swipe({ swipe: function (event, direction, distance, duration, fingerCount) {
            if (theImage) {
                var tg = theImage._graphicsLayer.graphics;
                if (direction == "left") {
                    nextIndex = tg.indexOf(theImage) < 11 ? tg.indexOf(theImage) : -1;
                    nextIndex = nextIndex + 1;
                } else {
                    nextIndex = tg.indexOf(theImage) > 0 ? tg.indexOf(theImage) : 12;
                    nextIndex = nextIndex - 1;
                }
                map.centerAndZoom(new esri.geometry.Point(tg[nextIndex].geometry.x + 10000,
                tg[nextIndex].geometry.y + 10000, new esri.SpatialReference({ wkid: 102100 })), 12);
                theImage = tg[nextIndex];
            }}, threshold: 75});});
function facebookWallPost() {
    var theindex = 0; if (theImage) { theindex = theImage._graphicsLayer.graphics.indexOf(theImage) }
    var tc = 'View from the International Space Station';
    FB.ui({ method: 'feed', name: 'ISERV Image Viewer', caption: tc, description: ('Image from ISERV'),
          link: 'http://3.0websitedesigns.com/arcgis100lines/',
          picture: 'http://3.0websitedesigns.com/arcgis100lines/' + mil.getImages()[theindex].href},
      function (response) {if (response && response.post_id) {alert('Post was published.');
          } else {alert('Post was not published.'); }});}
$(document).ready(function () {
    try {
        window.fbAsyncInit = function () {
            FB.init({appId: '1428805310695091', status: true,  xfbml: true }); }; } catch (e) { alert(e); }
}, false);
var myLocation;
function fullextent() { map.centerAndZoom(new esri.geometry.Point(-89, 10), 3); }

