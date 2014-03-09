var wordslist,Abr,statesname,path=[],radiocheck=1,bi=0,restart,render,map,stack=[],wordsstates=[];
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
 "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/renderers/SimpleRenderer",
"esri/layers/LabelLayer", "esri/renderers/UniqueValueRenderer", "dojo/parser", "dojo/_base/Color",
  "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
], function (
Map, FeatureLayer, InfoTemplate, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, SimpleRenderer,
 LabelLayer, UniqueValueRenderer, parser, Color
) {
    parser.parse();
    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
    SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([20, 60, 255, 0.7]));
    var renderer = new UniqueValueRenderer(defaultSymbol, "STATE_ABBR");
    map = new Map("map", { basemap: "oceans", center: [-95.625, 39.243], zoom: 4, slider: false });
    map.on("load", addFeatureLayer);
    $("#radioset").buttonset();
    $("#refreshbutton").button();
    var statesRenderer = new SimpleRenderer(new SimpleFillSymbol("solid",
     new SimpleLineSymbol("solid", new Color("#666"), 1.5), null));
    function addFeatureLayer() {
        var featureLayer = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/"+
        "rest/services/USA_States_Generalized/FeatureServer/0",
{ mode: FeatureLayer.MODE_ONDEMAND, outFields: ["STATE_NAME", "STATE_ABBR", "SUB_REGION"] });
        wordslist = document.getElementById("words").outerText.split(",");
        Abr = document.getElementById("abr").outerText.split(",");
        statesname = document.getElementById("statesname").outerText.split(",");
        var d = document.getElementById("wordsstates").outerText.split(";");
        for (var i = 0; i < d.length; i++) {var di = d[i].split(","); var di2 = [];
            for (var j = 0; j < di.length; j++) di2[j] = parseInt(di[j]);
            wordsstates[i] = di2;
        }
        for (i = 1; i <= 50; i++) stack[i] = i;
        featureLayer.setRenderer(renderer);
        var statesLabel = new TextSymbol().setColor(new Color([0, 0, 0, 1]));
        statesLabel.font.setSize("7pt");
        statesLabel.font.setFamily("arial");
        statesLabel.font.setWeight("WEIGHT_BOLD");
        var statesLabelRenderer = new SimpleRenderer(statesLabel);
        var labels = new LabelLayer({ id: "labels" });
        labels.addFeatureLayer(featureLayer, statesLabelRenderer, "${STATE_NAME}");
        labels.disableMouseEvents();
        map.addLayer(labels);
        map.addLayer(featureLayer);
        restart = function () {
            for (i = 0; i < Abr.length; i++) renderer.removeValue(Abr[i]);
            $("#answerlist").html("Possible words (Number of extra-steps needed): <br>");
            $("#listdiv").html("");
            path = [];
            for (i = 1; i <=50; i++) stack[i] = i;
            featureLayer.redraw();}
        $("#dialog").dialog({ autoOpen: true, width: 400 });
        featureLayer.on("click", function (evt) {
            if (stack.indexOf(Abr.indexOf(evt.graphic.attributes.STATE_ABBR)) != -1) {
                stack = [];
                for (i = 0; i < Abr.length; i++) renderer.removeValue(Abr[i]);
                renderer.addValue(evt.graphic.attributes.STATE_ABBR, SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]), 2), new Color([0, 0, 50, 0.7])));
                var f = Abr.indexOf(evt.graphic.attributes.STATE_ABBR);
                path[path.length] = f;
                for (i = 1; i <= 50; i++) {
                    if (link[f].indexOf(i) == -1 && i != f) {
                        renderer.addValue(Abr[i], SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new 
                        Color([255, 255, 255]), 2), new Color([220, 220, 220, 0.7])));
                    }
                    else if (i != f) stack[stack.length] = i;
                }
                featureLayer.redraw();
                $('#listdiv').append('<button id="button' + ++bi +
                '"style="width:90%;margin-left:5%;font-size:small">' + statesname[f]
                + '</button>').trigger('create');
                $("#button" + bi).button();
                $("#answerlist").html("Possible words (Number of extra-steps needed): <br>");
if (path.length <= 10)
for (i = 0; i < 1005; i++) {
if ((path.length + radiocheck < wordsstates[i][0]) || (path.length > wordsstates[i][0]))
continue;
var cc = 1;
for (j = 1; j <= path.length; j++) { if (path[j - 1] != wordsstates[i][j]) { cc = 0; break; } }
if (cc == 1) {
if (wordsstates[i][0] - path.length > 0)
$('#answerlist').append(wordslist[i] + "(" + (wordsstates[i][0] - path.length) + "), ");
else
$('#answerlist').append(wordslist[i] + ", ");
                        }}         }       });   } });