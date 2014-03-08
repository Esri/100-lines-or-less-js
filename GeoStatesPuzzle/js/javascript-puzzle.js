        var map;
        var statesname=["Alabama","Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","NewHampshire","NewJersey","NewMexico","NewYork","NorthCarolina","NorthDakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","SouthCarolina","SouthDakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
        var Abr = ["", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
        var stack = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
        var path = [],radiocheck = 1,bi=0;;
        var restart, render;
        require([
        "esri/map", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
         "esri/symbols/TextSymbol", "esri/renderers/SimpleRenderer", "esri/layers/LabelLayer", "esri/renderers/UniqueValueRenderer",
         "dojo/parser", "dojo/_base/Color", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
      ], function (
        Map, FeatureLayer, InfoTemplate, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, SimpleRenderer, LabelLayer, UniqueValueRenderer, parser, Color
      ) {
          parser.parse();
          var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([20, 60, 255, 0.7]));
          var renderer = new UniqueValueRenderer(defaultSymbol, "STATE_ABBR");
          map = new Map("map", {
              basemap: "oceans",
              center: [-95.625, 39.243],
              zoom: 4,
              slider: false
          });
          map.on("load", addFeatureLayer);
          $("#radioset").buttonset();
          $("#refreshbutton").button();
          var statesRenderer = new SimpleRenderer(new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color("#666"), 1.5), null));
          function addFeatureLayer() {
              var featureLayer = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0", {
                  mode: FeatureLayer.MODE_ONDEMAND,
                  outFields: ["STATE_NAME", "STATE_ABBR", "SUB_REGION", ]
              });
              featureLayer.setRenderer(renderer);
              //featureLayer.setSelectionSymbol(new SimpleFillSymbol().setColor(new Color([0, 80, 239, 1])));
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
                  for (i = 0; i < Abr.length; i++)
                      renderer.removeValue(Abr[i]);
                  $("#answerlist").html("Possible words (Number of extra-steps needed): <br>");
                  $("#listdiv").html("");
                  path = [];
                  stack = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
                  featureLayer.redraw();
              }
              $("#dialog").dialog({
                  autoOpen: true,
                  width: 400
              });
              featureLayer.on("click", function (evt) {
                  if (stack.indexOf(Abr.indexOf(evt.graphic.attributes.STATE_ABBR)) != -1) {
                      stack = [];
                      for (i = 0; i < Abr.length; i++)
                          renderer.removeValue(Abr[i]);
                      renderer.addValue(evt.graphic.attributes.STATE_ABBR, SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([0, 0, 50, 0.7])));
                      var f = Abr.indexOf(evt.graphic.attributes.STATE_ABBR);
                      path[path.length] = f;
                      for (i = 1; i <= 50; i++) {
                          if (link[f].indexOf(i) == -1 && i != f) {
                              renderer.addValue(Abr[i], SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 2), new Color([220, 220, 220, 0.7])));
                          }
                          else if (i != f)
                              stack[stack.length] = i;
                      }
                      featureLayer.redraw();
                      $('#listdiv').append('<button id="button' + ++bi + '"style="width:90%;margin-left:5%;font-size:small">' + statesname[f] + '</button>').trigger('create');
                      $("#button" + bi).button();
                      $("#answerlist").html("Possible words (Number of extra-steps needed): <br>");
                      if (path.length <= 10)
                          for (i = 0; i < 1006; i++) {
                              if ((path.length + radiocheck < wordsstates[i][0]) || (path.length > wordsstates[i][0]))
                                  continue;
                              var cc = 1;
                              for (j = 1; j <= path.length; j++) {
                                  if (path[j - 1] != wordsstates[i][j]) {
                                      cc = 0;
                                      break;
                                  }
                              }
                              if (cc == 1) {
                                  if (wordsstates[i][0] - path.length > 0)
                                      $('#answerlist').append(wordslist[i] + "(" + (wordsstates[i][0] - path.length) + "), ");
                                  else
                                      $('#answerlist').append(wordslist[i] + ", ");
                              }
                          }
                  }
              });
          }
      });
