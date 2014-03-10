require(["esri/map","esri/dijit/LocateButton","esri/dijit/Geocoder","esri/geometry/Polyline",
	"esri/symbols/SimpleLineSymbol","esri/graphic","dojo/on","dojo/dom-style","dojo/dom-construct",
	"dojo/dom-class","dijit/form/VerticalSlider","dojo/keys","dojo/query","dojo/domReady!"],
function (Map, Locater, Geocoder, Polyline, LineSymbol, Graphic, dojoOn, domStyle, domConstruct,
	domClass, Slider, keys, dQuery) {
	var gas = new Slider({value: 0, minimum: -20, maximum: 40, intermediateChanges: true}, "gas"),
		d = document, gauges = [d.getElementById("speed"), d.getElementById("cardinal")], 
		mapcfg = {basemap: "satellite", showAttribution: false, center: [-115.17,36.13], zoom:19},
		lineCfg = {type:"esriSLSSolid", color: [165,42,42,192], width:10}, 
		stepTime = new Date(), isDrivn = false, map, prop, position, gas, locateBtn, trail;
	function updateSpeed() {
		var newTime = new Date(), 
			speed = Math.abs(gas.value / (newTime - stepTime)) * 2237; // m/ms => mph
		gauges[0].innerHTML = speed.toFixed(1); // update speedometer
		stepTime = newTime;
	}
	function newPosition (pos, speed, angle) { // calculate position
		pos.x -= (speed * Math.sin(angle)); pos.y += (speed * Math.cos(angle)); return pos;
	}
	function isGassed() { // test whether car needs to keep moving.
		updateSpeed(); isDrivn = !!gas.value; if (isDrivn) { drive(); } 
	}
	function drive () {// draw trail, calculate new position, and use map.centerAt to move.
		var len = trail.geometry.paths[0].length; trail.geometry.insertPoint(0, 0, position); 
		while (len > 100) { trail.geometry.removePoint(0,len); len--;}
		map.graphics.refresh();
		position = newPosition(position, gas.value, prop.angle * Math.PI / 180);
		map.centerAt(position).then(isGassed);
	}
	function resetPos(point) { // set position on map at start or when changed by search/geolocate
		position = point || map.extent.getCenter(); 
		trail.geometry = new Polyline(map.spatialReference).addPath([position]);
	}
	function resizeMap() { // reset map div size so when it spins, user doesn't see the edge.
		var w = d.body.offsetWidth, h = d.body.offsetHeight, diag = Math.sqrt(w*w + h*h);
		domStyle.set("map", {width: diag + "px", height: diag + "px", 
			margin: ((h-diag)/2) + "px 0 0 " + ((w-diag)/2) + "px"
		}); 
		if (map) {map.on("update-end", function () {resetPos();});}
	}
	function getCardinal(dd) { // get north, south, east, or west directions from map angle.
		var dir; dd = dd % 360; dd = dd < 0 ? 360 + dd : dd;
		dir = (dd <= 67.5 || dd >= 292.5) ? "N" : ((dd >= 112.5 && dd <= 247.5) ? "S" : "");
		return dir + ((dd > 22.5 && dd < 157.5) ? "W" : ((dd > 202.5 && dd < 337.5) ? "E" : ""));
	}
	function playSound(file) {
		var audio = new Audio(), M_a = Modernizr.audio;
		audio.src = file + (M_a.ogg ? '.ogg' : M_a.mp3 ? '.mp3' : '.m4a');
		audio.play();
	}
	resizeMap();
	dojoOn(window, (window.onorientationchange ? "orientationchange": "resize"), resizeMap);
	gas.on("change", function () {if (!isDrivn) { isDrivn = gas.value; drive();}}); 
	gas.on("focus", function (evt) { d.body.focus();});
	dojoOn(d.getElementById("brake"), "click", function () { // stop car.
		gas.set("value", 0); d.body.focus();
	});
	dQuery(".pick_button").on("click", function (evt) {domClass.add("car", evt.target.name);});
	dQuery(".closer").on("click", function (e) { domClass.add(e.target.parentNode, "hidden");});
	dQuery(".open-next").on("click", function (e) { domClass.remove(e.target.name, "hidden");});
	dQuery(".sounder").on("click", function (e) {playSound(e.target.name);});
	dojoOn(d.body, "keydown", function (evt) {
		var code = evt.keyCode || evt.charCode;
		switch(code) {
			case keys.UP_ARROW: gas.set("value", Math.min(40, gas.value + 5)); break; // forward
			case keys.RIGHT_ARROW: prop.speed = prop.speed - 3; break; // turn right
			case keys.LEFT_ARROW: prop.speed = prop.speed + 3; break; // turn left
			case keys.DOWN_ARROW: gas.set("value", Math.max(-20, gas.value - 5)); break; //reverse
			case keys.SPACE: playSound("audio/horn"); break;
		}
	});
	gas._onKeyDown = function (a) {}; // fix for issue when slider doesn't bubble keydown event.
	map = new Map("map", mapcfg);
	locateBtn = new Locater({map: map, highlightLocation: false}, "locateBtn");
	locateBtn.startup(); // lets user zoom to their current location.
	locateBtn.on("locate", function () {resetPos();}); 
	map.on("load", function () {
		var geocoder = new Geocoder({map: map}, "search"); geocoder.startup();
		geocoder.on("select", function (res) { 
			resetPos(res.extent.getCenter()); // reset map position when geocoder is used.
		});
		trail = new Graphic(new Polyline(map.spatialReference), new LineSymbol(lineCfg));
		resetPos(map.extent.getCenter()); // set map center.
		map.graphics.clear(); map.graphics.add(trail); // add trail graphic
		map.disableMapNavigation(); // stop normal map navigation (zoom in/out buttons okay).
		domConstruct.place("map_zoom_slider", "newzoomspot", "first"); // make zoom slider visible
		prop = new Propeller(document.getElementById("map"), {
			inertia: 0.8, onRotate: function () { gauges[1].innerHTML = getCardinal(this.angle); 
			if (Math.abs(prop.speed) > 0.4) { 
				domClass.add("drift", prop.speed > 0 ? "left" : "right"); // adds dust on drift
				setTimeout(function () {domClass.remove("drift", ["left","right"]);}, 600);
			} else {
				domClass.remove("drift", ["left","right"]); // removes dust
			}}
		});
	});
});