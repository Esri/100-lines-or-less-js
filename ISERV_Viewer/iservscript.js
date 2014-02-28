var map, lyrOpacityFlag;
var theImage;
var mil;
var iconlayer;
require(["esri/map", "esri/dijit/BasemapToggle", "esri/layers/MapImageLayer", "esri/layers/MapImage"
    , "esri/geometry/Extent", "esri/SpatialReference", "dijit/form/HorizontalSlider",  "dojo/domReady!"],
    function (Map, BasemapToggle, dom, on, parser, ready) {
        map = new Map("map", { center: [-89, 10], zoom: 3, basemap: "topo" });
        var toggle = new BasemapToggle({ map: map, basemap: "satellite" }, "BasemapToggle");
        toggle.startup();
        iconlayer = new esri.layers.GraphicsLayer();
        mil = new esri.layers.MapImageLayer();
        map.addLayer(mil);
        AddImage(3901502.456128, -1870696.918164, 3923322.831518, -1849667.534159, 'img/IP0201304091331271648S03515E.png');
        AddImage(-9681779.793953, 4084464.249489, -9657210.471269, 4109707.831313, 'img/IP0201304202012063451N08685W.png');
        AddImage(-11787934.058859, 4590359.944748, -11762671.059242, 4616485.119939, 'img/IP0201306251940383817N10578W.png');
        AddImage(-8390298.499823, 4838223.882072, -8362584.852032, 4867362.614902, 'img/IP0201306261720303991N07524W.png');
        AddImage(-13052438.975308, 3840644.067959, -13028142.265796, 3865052.895345, 'img/IP0201306281848093268N11715W.png');
        AddImage(-9861727.954269, 1482863.343913, -9838378.064428, 1504215.967888, 'img/IP0201307021357031329N08847W.png');
        AddImage(586837.394485, 5756551.433855, 614258.033259, 5787175.244654, 'img/IP0201308171624594595N00539E.png');
        AddImage(11686673.688679, 2221452.608327, 11708750.057893, 2242834.669357, 'img/IP0201310270319591965N10508E.png');
        AddImage(9937184.014455, 3274787.531706, 9960202.696492, 3297776.978506, 'img/IP0201311260147492829N08937E.png');
        AddImage(-7980433.729840, -1564762.601321, -7959108.928618, -1544135.098798, 'img/IP0201311291333291383S07159W.png');
        AddImage(9595738.689578, 3218881.087547, 9618966.099158, 3241841.340859, 'img/IP0201312260520262785N08630E.png');
        AddImage(4337194.440358, -705166.511542, 4358756.203225, -684723.609897, 'img/IP0201402061342570623S03906E.png');
        
        var slider = new dijit.form.HorizontalSlider({
            name: "slider",
            value: 1,
            minimum: .1,
            maximum: 1,
            intermediateChanges: true,
            style: "width:300px;",
            onChange: function (value) {
                mil.setOpacity(value);
            }
        }, "slider");
        init();
        function init() {
            var supportsOrientationChange = "onorientationchange" in window,
            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

            window.addEventListener(orientationEvent, function () {
                orientationChanged();
            }, false);
            lyrOpacityFlag = false;
            removeDynMapListener();
        }
        function orientationChanged() {
            if (map) {
                map.reposition();
                map.resize();
            }
        }
        function removeDynMapListener() {
            if (window.DeviceMotionEvent) {  
                var threshhold = 20;
                var xPreTotalAcc, yPreTotalAcc, zPreTotalAcc = 0;
                var xPostTotalAcc, yPostTotalAcc, zPostTotalAcc = 0;
                window.addEventListener('devicemotion', function (e) {
                    
                    xPreTotalAcc = e.acceleration.x;
                    yPreTotalAcc = e.acceleration.y;
                    zPreTotalAcc = e.acceleration.z;
                });
                setInterval(function () {
                    var change = Math.abs(xPreTotalAcc - xPostTotalAcc + yPreTotalAcc - yPostTotalAcc + zPreTotalAcc - zPostTotalAcc);
                    if (change > threshhold) {
                        map.centerAndZoom(new esri.geometry.Point(-89, 10), 3)
                    }
                    xPostTotalAcc = xPreTotalAcc;
                    yPostTotalAcc = yPreTotalAcc;
                    zPostTotalAcc = zPreTotalAcc;
                }, 150);
            } else {
                alert("DeviceMotion is currently not supported on this hardware.");
            }
        }

    });
function onClick(e) {
    if(map.getZoom() < 11){ 
        map.centerAndZoom(new esri.geometry.Point(e.graphic.geometry.x + 10000, e.graphic.geometry.y + 10000, new esri.SpatialReference({ wkid: 102100 })), 11)
    }
}
function AddImage(xmin, ymin, xmax, ymax, href) {
    var geometrya = new esri.geometry.Point(xmin, ymin, new esri.SpatialReference({ wkid: 102100 }));
    iconlayer.add(new esri.Graphic(geometrya, new esri.symbol.PictureMarkerSymbol("marker.png", 45, 45)));
    map.addLayer(iconlayer);
    dojo.connect(iconlayer, "onClick", onClick);
    var mi = new esri.layers.MapImage({
        'extent': new esri.geometry.Extent({
            "xmin": xmin, //left
            "ymin": ymin, //bottom
            "xmax": xmax, //right
            "ymax": ymax, //top
            "spatialReference": {
                "wkid": 102100
            }
        }), 'href': href
    });
    mil.addImage(mi);
}


