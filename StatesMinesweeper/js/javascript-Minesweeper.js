var Abr, statesname, restart, renderer, map, featureLayer1, featureLayer2,mm=4;
var block = [0, 19, 29, 45, 21, 39, 7, 32, 30, 8, 20, 38, 46, 48, 35, 2, 11];
var bomb = [], sadd = [], renderer1, renderer2, clean=[];
var link = [[],[1,9,10,24,42],[],[3,5,6,28,31,44],[4,18,24,25,36,42,43],[5,37,28,3],
[6,3,16,36,27,31,44,50],[7,21,32,39],[8,20,30,38],[9,1,10],[10,1,9,33,40,42],[],
[12,26,28,37,44,47,50],[13,14,15,17,25,49],[14,13,17,22,35],[15,13,23,25,27,41,49],
[16,6,25,27,36],[17,13,14,25,35,42,46,48],[18,4,24,43],[19,29],[20,8,38,46,48],
[21,7,29,32,39,45],[22,14,35,49],[23,15,34,41,49],[24,1,4,18,42],[25,4,13,15,16,17,27,36,42],
[26,12,34,41,50],[27,6,15,16,25,41,50],[28,3,5,12,37,44],[29,19,21,45],[30,8,32,38],
[31,3,6,36,43,44],[32,7,30,21,38,45],[33,10,40,42,46],[34,23,26,41],[35,14,17,22,38,48],
[36,4,6,16,25,31,43],[37,5,12,28,47],[38,8,20,30,32,35,48],[39,7,21],[40,10,33],
[41,15,23,26,27,34,50],[42,1,4,10,17,24,25,33,46],[43,4,18,31,36],[44,3,6,12,28,31,50],
[45,21,29,32],[46,17,20,33,42,48],[47,12,37],[48,17,20,38,35,46],[49,13,15,22,23],
[50,6,12,26,27,41,44]];
require([
"esri/map", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/symbols/SimpleLineSymbol",
"esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/symbols/Font",
"esri/renderers/SimpleRenderer", "esri/layers/LabelLayer", "esri/renderers/UniqueValueRenderer",
"dojo/parser", "dojo/_base/Color", "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
"dojo/domReady!"], function (
Map, FeatureLayer, InfoTemplate, SimpleLineSymbol, SimpleFillSymbol, TextSymbol,
 Font, SimpleRenderer, LabelLayer, UniqueValueRenderer, parser, Color)
{   parser.parse();
    var defaultSymbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
    SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([150, 150, 150, 1]));
    var defaultSymbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
    SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([100, 100, 255, 1]));
    map = new Map("map", { basemap:"oceans", center:[-95.625, 39.243], zoom:4, slider:false });
    map.on("load", addFeatureLayer);
    $("#refreshbutton").button();
    function addFeatureLayer()
    {   Abr = document.getElementById("abr").outerText.split(",");
        statesname = document.getElementById("statesname").outerText.split(",");
        featureLayer1 = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS" +
        "/rest/services/USA_States_Generalized/FeatureServer/0",
        { mode: FeatureLayer.MODE_ONDEMAND, outFields: ["STATE_NAME","STATE_ABBR","SUB_REGION"]});
        featureLayer2 = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS" +
        "/rest/services/USA_States_Generalized/FeatureServer/0",
        { mode: FeatureLayer.MODE_ONDEMAND, outFields: ["STATE_NAME","STATE_ABBR","SUB_REGION"]});
        renderer1 = new UniqueValueRenderer(defaultSymbol1, "STATE_ABBR");
        renderer2 = new UniqueValueRenderer(defaultSymbol2, "STATE_ABBR");
        featureLayer1.setRenderer(renderer1);
        featureLayer2.setRenderer(renderer2);
        map.addLayer(featureLayer2);
        map.addLayer(featureLayer1);
        $("#dialog").dialog({ autoOpen: true, width: 400 });
        for (var i = 0; i <= 50; i++)  sadd[i] = 0;
        var f = 0;
        while (f < mm)
        {   var k = Math.floor((Math.random() * 50) + 1);
            if (block.indexOf(k) == -1 && bomb.indexOf(k) == -1)
            {   f++; bomb[bomb.length] = k;
                renderer2.addValue(Abr[k], SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]), 2), new Color([255, 50, 50, 1])));
                featureLayer2.redraw();
            }
        }
        for (var i = 0; i < mm; i++)
            for (var j = 1; j <= link[bomb[i]].length; j++) sadd[link[bomb[i]][j]]++;
        for (var i = 1; i <= 50; i++)
        {   if (sadd[i] > 0 && bomb.indexOf(i) == -1)
                renderer2.addValue(Abr[i], SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]), 2), new Color([255, 255, 80, 1])));
        }
        featureLayer2.redraw();
        function cleanner(k)
            {   clean[clean.length] = k;
                renderer1.addValue(Abr[k], SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]), 2), new Color([255, 255, 0, 0])));
                featureLayer1.redraw();
                if (sadd[k] == 0) for (var i = 1; i <link[k].length; i++)
                    if (bomb.indexOf(link[k][i]) == -1 && clean.indexOf(link[k][i]) == -1)
                        cleanner(link[k][i]);
                return;}
        cleanner(2);cleanner(11);
        featureLayer1.on("click", function (evt)
        {   var ck = Abr.indexOf(evt.graphic.attributes.STATE_ABBR);            
            if (bomb.indexOf(ck) != -1)
            {   for (var i = 0; i < Abr.length; i++) renderer1.removeValue(Abr[i]);
                for (var i = 0; i <= 50; i++)
                    renderer1.addValue(Abr[i], SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]), 2), new Color([255, 255, 50, 0])));
                featureLayer1.redraw();
                alert("BOOM!!!!!");
                location.reload();}
            else if (sadd[ck] >= 0 && clean.indexOf(ck) == -1)
                cleanner(ck);
            featureLayer1.redraw();
            if (clean.length >= 46)
            {  alert("You win!!!!!");
                location.reload();}
        });
    }
});