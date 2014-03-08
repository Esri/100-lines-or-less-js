define(["dojo/dom-class","dojo/dom-style","dojo/dom","dojo/on","dojo/json","dojo/window",
"dojo/_base/array","dojo/dom-attr", "esri/map", "dojo/io-query"    ,"esri/arcgis/utils",
"dojo/dom-construct","dojox/mobile/parser","dojo/query","esri/geometry/screenUtils","dojo/ready",
"dojo/domReady!"],
function(domClass,domStyle,dom,on,JSON,win,arrayUtil,domAttr, Map,ioQuery,arcgisUtils,
    domConstruct,parser,dojoQuery,screenUtils,ready){        
        var init = function(){
            parser.parse();
            var url = window.location.href;
            var queryString = ioQuery.queryToObject(url);
            var webMapID = queryString.map || "b1206fca74aa4d2fab5debb1551d5e56";               
            var viewHeight = 5000;
            var mapHandler = function(response){
                var vs = win.getBox();                      
                var map = response.map;                     
                var graphicLayerId = map.graphicsLayerIds[0];                       
                var graphics = map.getLayer(graphicLayerId).graphics;                       
                var i = 0;
                on(map.getLayer(graphicLayerId), "graphic-draw", function (evt) {
                    var keyPos = (viewHeight/graphics.length)*(i+1);
                    var prevPos = keyPos-(viewHeight/graphics.length);
                    var nextPos = keyPos+(viewHeight/graphics.length);
                    i++;                            
                    evt.node.setAttribute("data-"+prevPos, "fill:rgb(0,0,255);fill-opacity:0.5");
                    evt.node.setAttribute("data-"+keyPos, "fill:rgb(255,0,0);fill-opacity:1");
                    evt.node.setAttribute("data-"+nextPos, "fill:rgb(0,0,255);fill-opacity:0.5");
                    if (i+1==graphics.length) {
                        var s = skrollr.init({
                        edgeStrategy: 'set',
                        easing: {
                            WTF: Math.random,
                            inverted: function(p) {
                                return 20-p;
                            }
                        },
                        render: function(data){
                            console.log(data);
                            dojoQuery('#scrollpos').forEach(function(node){node.innerHTML=data.curTop});    
                            domClass.add("tourInfo","dijitHidden");
                            domClass.add("tourImg","dijitHidden");
                        }
                        });
                    }
                    
                });                     
                on(window,"click",function(){
                    console.log(arguments);
                })
                arrayUtil.forEach(graphics,function(g,i){                           
                    var screenGeom = screenUtils.toScreenGeometry(map.extent,map.width,map.height,g.geometry);
                    var keyPos = (viewHeight/graphics.length)*(i+1);
                    var prevPos = keyPos-(viewHeight/graphics.length);
                    var nextPos = keyPos+(viewHeight/graphics.length);                                                      
                    var left = screenGeom.x - (vs.w/2);                         
                    var top = screenGeom.y - (vs.h/2);                          
                    domAttr.set("map", "data-"+(keyPos-100), "");
                    domAttr.set("map", "data-"+keyPos, "left:-"+left+"px;top:-"+top+"px;");
                    domAttr.set("map", "data-"+(keyPos+100), "");                           
                    var jsonStr = '{"'+"data-"+prevPos+'": "border-right-color:rgb(32,7,114);",'+           
                                    '"data-'+keyPos+'": "border-right-color:rgb(255,0,0);",'+               
                                    '"data-'+nextPos+'": "border-right-color:rgb(32,7,114);",'+
                                    '"class":"spot tooltip","data-title":"'+g.attributes.Name+'"}';                             
                    var linkJson = JSON.parse(jsonStr);                     
                    var jsonStr2 = '{"'+"data-"+prevPos+'": "opacity:0;","data-'+keyPos+'": "opacity:1;",'+
                    '"data-'+nextPos+'": "opacity:0;","class":"spotLabel","innerHTML":"'+g.attributes.Name+'"}';    
                    var labelJson = JSON.parse(jsonStr2);         
                    var itemContainer = domConstruct.create("div",{"class":"spotItem"},"spotlinks");
                    var spotLabel = domConstruct.create("span",labelJson,itemContainer);
                    var spotButton = domConstruct.create("div",linkJson,itemContainer);                         
                    on(spotButton,"click,touch",function(evt){    
                        var jumpToTop = (top*-1)+"px";
                        var s = skrollr.get();
                        s.animateTo(keyPos+10, { duration: 600 });
                    })
                    on(spotLabel,"click,touch",function(evt){   
                        domClass.toggle("tourInfo","dijitHidden");
                        domClass.toggle("tourImg","dijitHidden");
                        if (!domClass.contains("tourInfo","dijitHidden")){
                            dom.byId("tourInfo").innerHTML = g.attributes.Desc;
                            dom.byId("tourImg").innerHTML = "";
                            var img = domConstruct.create("img",{"src":"images/"+g.attributes.Url},"tourImg");              
                        }
                    })                          
                }) //array graphics                                         
        }

        arcgisUtils.createMap(webMapID, "map",{mapOptions:{"spatialReference":{wkid:102100},
              center: [55.125275,25.135339], // long, lat
              zoom: 13,
              slider: false},
              ignorePopups:false}).then(mapHandler);
            
        }
        var publicProps = {startup: function(){init();}};
        return publicProps;
    })