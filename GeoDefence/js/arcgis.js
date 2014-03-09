window.onbeforeunload = function (event) {
    if (app.position) {
        CallWCF("POST", "DeleteUserPosistion", "{\"x\":" + app.position.coords.longitude + ",\"y\":" + app.position.coords.latitude + "}", function (res) {
        });
    }

};
var app = {};
//app.MapServiceURl = "http://192.168.9.183/geodefence/service1.svc";
app.geometryServiceURL = "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
app.MapServiceURl = "http://196.218.18.149/GeoDefence/Service1.svc";
function init() {
    require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "dojo/_base/connect",
"esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
"esri/graphic", "dojo/_base/Color", "esri/toolbars/draw", "esri/tasks/GeometryService",
"esri/layers/GraphicsLayer", "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js"],
function (Map, ArcGISTiledMapServiceLayer, connect, Point, SimpleMarkerSymbol,
SimpleLineSymbol, Graphic, Color, Draw, GeometryService, GraphicsLayer, BootstrapMap) {
    app.usedPoints = [];
    app.map = new Map("map");
    var myLayer = new ArcGISTiledMapServiceLayer
    ("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    myLayer.id = "BaseMap";
    this.app.map.addLayer(myLayer);
    app.geometryService = new GeometryService(app.geometryServiceURL);
    app.DrawToolbar = new Draw(app.map);
    esriConfig.defaults.io.proxyUrl = "/proxy.ashx";
    esriConfig.defaults.io.alwaysUseProxy = false;
    app.usersGraphicLayer = new GraphicsLayer();
    app.map.addLayer(app.usersGraphicLayer);
    connect.connect(app.DrawToolbar, 'onDrawEnd', startGeoDefence);
    connect.connect(app.map, "onExtentChange", GetALL);
    BootstrapMap.bindTo(app.map);
    connect.connect(app.map, "onLoad", function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            app.position = position;
            var pt = new Point(position.coords.longitude, position.coords.latitude);
            var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([210, 105, 30, 0.5]), 8),
            new Color([210, 105, 30, 0.9]));
            graphic = new Graphic(pt, symbol);
            app.map.graphics.add(graphic);
            app.map.centerAndZoom(pt, 18);
            CallWCF("POST", "AddUserPostion", "{\"x\":" + position.coords.longitude + ",\"y\":" + position.coords.latitude + "}", function (res) {
                setInterval(function () { GetALL(); }, 10000);
                GetALL();

            });
        });
    });
});
}
function GetALL() {
    if (app.position) {
        CallWCF("GET", "GetAllUsers", "{}", function (pnts) {
            app.usersGraphicLayer.clear(); app.Points = [];
            for (var i = 0; i < pnts.length; i++) {
                addSymbolPOint(pnts[i].PointX, pnts[i].PointY, pnts[i].status);
            }
        });
    }
}
function CallWCF(methodType, methodName, param, onCompleteFunc) {
    $.ajax({
        type: methodType, data: param, dataType: "json", processData: false,
        contentType: "application/json; charset=utf-8", url: app.MapServiceURl + "/" + methodName,
        success: function (val) { onCompleteFunc(eval(val).d); },
        error: function (err) { console.log(err); }
    });
}
function addSymbolPOint(x, y, status) {
    require(["esri/symbols/PictureMarkerSymbol", "esri/geometry/Point", "esri/graphic",
"esri/geometry/webMercatorUtils"], function (PictureMarkerSymbol, Point, Graphic, webMercatorUtils) {
    var imageURL;
    if (status == true) { imageURL = "images/circle_green.png"; }
    else { imageURL = "images/black-circle.jpg"; }
    var pictureMarkerSymbol = new PictureMarkerSymbol(imageURL, 10, 10);
    var pt = webMercatorUtils.geographicToWebMercator(new Point(x, y, app.map.spatialReference))
    app.Points.push(pt); graphic = new Graphic(pt, pictureMarkerSymbol);
    app.usersGraphicLayer.add(graphic);
});
}
function ActiveDrawtoolBar() {
    app.DrawToolbar.activate("polygon");
    if (app.map.graphics.graphics) {
        for (var i = 0; i < app.map.graphics.graphics.length; i++) {
            if (app.map.graphics.graphics[i].geometry.type == "polygon") {
                app.map.graphics.graphics[i].hide();
            }
        }
    } app.map.hideZoomSlider();
}
function startGeoDefence(polygon) {
    require([
"esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "dojo/_base/Color",
"esri/graphic"], function (SimpleFillSymbol, SimpleLineSymbol, Color, Graphic) {
    var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol
    (SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
    var graphicElement = new Graphic();
    graphicElement.geometry = polygon;
    graphicElement.symbol = sfs;
    app.map.graphics.add(graphicElement);
    app.DrawToolbar.deactivate();
    app.map.showZoomSlider();
    if (app.Points && app.position && app.Points.length > 0) {
        app.geometryService.intersect(app.Points, polygon, function (results) {
            var countIN = 0;
            var countOut = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].x.toString() != "NaN" && results[i].y.toString() != "NaN") {
                    countIN++;
                } else { countOut++; }
            }
            alert("No of users inside shape = " + countIN + "  & No of users outside shape = " + countOut + "");
        });
    }
});
}