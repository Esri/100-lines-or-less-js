var map, RocDef = {	
	DamCount: 0, ClearCount: 0, RocCount: 0,
	onLoad: function() {
		require(["dojo/query","dojo/dom","dojo/dom-style","dojo/NodeList-dom"],function(query,dom,domStyle){
			dojo.byId('Rockets').innerHTML = "";
			dojo.byId('US_Count_Text').innerHTML = "";
			dojo.byId('RocDef_Count_Text').innerHTML = "";
			RocDef.DamCount = 0;
			RocDef.ClearCount = 0;	
			RocDef.RocCount = Math.floor((Math.random()*10)+1);
  			for(i=1;i<=RocDef.RocCount;i++) {
  				var winH = Math.floor((Math.random()*(window.innerHeight-150))+1);
  				var winW = Math.floor((Math.random()*(window.innerWidth-150))+1);
  				dojo.create("div",{id:"Rock"+i,class:"rocket6",onClick:"RocDef.delRock('Rock"+i+"');"},
  					dojo.byId('Rockets'));	
  				domStyle.set("Rock"+i, {"left":winW+"px","top":winH+"px","position":"absolute"});  					
  			}
  			dojo.byId('RocDef_Count_Text').innerHTML = RocDef.RocCount;
		});		
		this.activateTimer();
	},
	activateTimer: function() {	
		require(["dojo/Evented","dojo/on","dojo/_base/declare","dojo/dom","dojo/query","dojo/NodeList-dom"],
			function(Evented, on, declare, dom, query){
				var counter = 6;
  				var Timer = declare([Evented], { timeout: 700,
    			start: function(){
      				this.stop();
      				this.emit("start", {});
      				var self = this;
      				this._handle = setInterval(function(){ self.emit("tick", {});}, this.timeout);
    			},
    			stop: function(){
      				if(this._handle){
        				clearInterval(this._handle);
        				delete this._handle;
        				this.emit("stop", {});
      				}
    			}
  				});
  				var timer = new Timer();
  				timer.on("tick", function(){
  					var newclass = counter-1;
    				query(".rocket"+counter).replaceClass("rocket"+newclass, "rocket"+counter);
    				counter--;
    				if(counter == 0) {
    					require(["dojo/query","dojo/dom-attr","dojo/NodeList-dom"], function(query,attr){
  							query(".rocket0").forEach(function(node){
  								RocDef.ajaxRequest(node.style.left,node.style.top,node.id);
  								attr.set(node, "onClick", "");
  							});
						});
					timer.stop();	
    				}    				
  				}); 
  				timer.start();
		});				
	},	
	ajaxRequest: function(pW,pH,pId) {	
		require(["esri/tasks/query","esri/tasks/QueryTask","esri/geometry/Extent","esri/SpatialReference",
		"esri/geometry/ScreenPoint"],function(Query,QueryTask,Extent,SpatialReference,ScreenPoint) {
			var scPoint = map.toMap(new ScreenPoint(pW.substring(0,pW.length-2),pH.substring(0,pH.length-2)));
  			var query = new Query();
  			var queryURL = "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/";
  			    queryURL = queryURL + "Demographics/ESRI_Census_USA/MapServer/1";
  			var queryTask = new QueryTask(queryURL);
  			query.geometry = scPoint;
  			query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
  			query.outFields = ["POP2007"];
  			queryTask.execute(query, RocDef.processResults);
		});
	},
	processResults: function(results) {
		for (var i=0, il=results.features.length; i<il; i++) {
			var featureAttributes = results.features[i].attributes;
			for (att in featureAttributes) {
            	RocDef.DamCount = RocDef.DamCount + featureAttributes[att];
            }          		
         }
         dojo.byId('US_Count_Text').innerHTML = RocDef.DamCount;		
	},	
	delRock: function(pParam) {
		require(["dojo/dom-construct"], function(domConstruct){
  			domConstruct.destroy(pParam);
  			RocDef.ClearCount++;
  			dojo.byId('RocDef_Count_Text').innerHTML = RocDef.ClearCount+"/"+RocDef.RocCount;
		});
	}
};
require(["dojo/dom-attr","dojo/NodeList-dom","esri/map","dojo/domReady!"],function(attr){
	map = new esri.Map("mapDiv", {
		center: [-97.3375400, 37.6922400],zoom:5,basemap:"streets"});
  	attr.set(dojo.byId('Title_BgImg'), "onClick", "RocDef.onLoad()");
});

