var map, locator, locSbl, font, layers, zoomLevel = 5;
require(["esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters",
"esri/tasks/locator", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/Font",
"esri/symbols/TextSymbol", "dojo/_base/Color", "dojo/dom", "dojo/domReady!"],
function (Map, ArcGISDynamicMapServiceLayer, ImageParameters,
Locator, Graphic, SimpleMarkerSymbol, Font, TextSymbol, Color, dom) {
    map = new Map("divMap", { basemap: "satellite", center: [-94.76384688, 35.3102925],
        zoom: zoomLevel, showAttribution: true, sliderOrientation: "horizontal",
        sliderPosition: "top-right", sliderStyle: "large"
    });  // Creating Map object
    var imageParameters = new ImageParameters();
    imageParameters.format = "jpeg";
    layers = new Array();
    locSbl = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE,10,null,new Color("#FFE428"));
    $("#divLyrOff").find("img").each(function (index) {
        layers[index] = new ArcGISDynamicMapServiceLayer(
            $(this).attr("data-svc-url"), { "opacity": 0.5, "imageParameters": imageParameters });
    }); // Creating Layers array
    locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
    font = new Font("16pt", Font.STYLE_NORMAL, Font.VARIANT_NORMAL,Font.WEIGHT_BOLD,"Helvetica");
    function zoomToCont(sender) {
        locate($(sender).attr("title"));
        $("#lblCurrCont").text("Locating " + $(sender).attr("title") + "...");
        $("#lblWidgetTitle").text($(sender).attr("title"));
        $("#divContList").find("img").switchClass("contGlb-curr","contGlb",500,"easeInOutQuad");
        $(sender).switchClass("contGlb", "contGlb-curr", 500, "easeInOutQuad");
        $("#divContInfo").html($("#divData_" + $(sender).attr('id')).html());
        $("#divContImageList").html($("#divImages_" + $(sender).attr('id')).html());
        $("#divContImageList").find("img").click(function () { locate($(this).attr("title")); });
    }
    function locate(place) {
        locator.outSpatialReference = map.spatialReference;
        locator.addressToLocations({ address: { "SingleLine": place} });
    }
    function locateToResult(evt) {
        var adr = evt.addresses[0];
        var attributes = {address:adr.address,score:adr.score,locatorName:adr.attributes.Loc_name};
        map.graphics.clear();
        map.graphics.add(new Graphic(adr.location, locSbl, attributes, null));
        var textSymbol = new TextSymbol(adr.address, font, new Color("#FF00FF"));
        map.graphics.add(new Graphic(adr.location, textSymbol.setOffset(0, 8)));
        map.centerAndZoom(adr.location, zoomLevel);
        $("#lblCurrCont").text($("#lblWidgetTitle").text());
    }
    locator.on("address-to-locations-complete", locateToResult);
    $(window).resize(reArrangeUI);  // Making the App responsive based on window size
    $("#divTbrNTtl").on('cssClassChanged', function () { zoomToCont($(".contGlb-curr").first());});
    $("#divToolbar").find("div").find("img").mouseover(function () { showMenuDialog(this); });
    $(".balloon-dialog").mouseleave(function () { $(this).css("visibility", "hidden"); });
    $("#divBMAll").find("img").mouseover(function () { $("#divEBM").text($(this).attr("title"));});
    $("#divBMAll").find("img").mouseleave(function () { $("#divEBM").text("Available Basemaps");});
    $("#divContList").find("img").click(function () { zoomToCont(this); });
    $("#divBMAll").find("img").click(function () { changeBaseMap(this); });
    $("#divBMCurr").append($("#satellite")); // Set to Satellite map Initially
    $("#divLyrOff").find("img").click(function () { switchLayer(this); });
    $(".win-icon").click(function () {
        $("#" + $(this).attr("id").substring(4)).toggle();
        $(this).toggleClass("win-icon-off");
    });
    reArrangeUI();  // Change orientation based on initial window size
});
function reArrangeUI() {
    var w = $(window).width(), h = $(window).height();
    zoomLevel = Math.round(((w < h) ? w : h) / 200); //Calculating Zoomlevel from window size
    $(".balloon-dialog").css("visibility", "hidden");
    if ((w > h) && $("#divTbrNTtl").hasClass("tbrNTitle-mobile")) {
        $("#divTbrNTtl").removeClass("tbrNTitle-mobile").addClass("tbrNTitle-desktop");
        $("#divContContainer").removeClass("contPanel-mobile").addClass("contPanel-desktop");
        $("#divInfoWdg").removeClass("widgetInfo-mobile").addClass("widgetInfo-desktop");
        $("#divTbrNTtl").trigger('cssClassChanged');
    }
    else if ((w < h) && $("#divTbrNTtl").hasClass("tbrNTitle-desktop")) {
        $("#divTbrNTtl").removeClass("tbrNTitle-desktop").addClass("tbrNTitle-mobile");
        $("#divContContainer").removeClass("contPanel-desktop").addClass("contPanel-mobile");
        $("#divInfoWdg").removeClass("widgetInfo-desktop").addClass("widgetInfo-mobile");
        $("#divTbrNTtl").trigger('cssClassChanged');
    }
}
function showMenuDialog(sender) {
    $(".balloon-dialog").css("visibility", "hidden");
    var senderPos = $(sender).offset();
    posTop = senderPos.top + ($(sender).width() / 2);
    posLeft = senderPos.left + ($(sender).height() / 2);
    $("#dlg_" + $(sender).attr("id")).css({ top: posTop, left: posLeft });
    $("#dlg_" + $(sender).attr("id")).css("visibility", "visible");
}
function changeBaseMap(sender) {
    map.setBasemap($(sender).attr("id"));
    $("#divBMAll").append($("#divBMCurr").find("img"));
    $("#divBMCurr").append(sender);
    $("#lblCurrBasemap").text($(sender).attr("title"));
}
function switchLayer(sender) {
    var pDiv = $(sender).closest("div").attr("id");
    var selLayer = layers[$(sender).attr("id").substring(3)];
    ((pDiv == "divLyrOff") ? map.addLayer(selLayer) : map.removeLayer(selLayer));
    $(((pDiv == "divLyrOff") ? "#divLyrOn" : "#divLyrOff")).append(sender);
}