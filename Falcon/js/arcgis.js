require(["esri/map", "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js",
"dojo/domReady!", "esri/layers/graphics", "esri/geometry/webMercatorUtils", "esri/InfoTemplate",
"esri/geometry/webMercatorUtils", ], 
	function(Map, BootstrapMap) {
		var username, group, color, myPosRef, groupPosRef, groupChatRef;
		var firstTime = true;
		var map = BootstrapMap.create("mapDiv",{ basemap:"streets", 
			center:[-45.8724294, -23.1878688], zoom:12, isScrollWheelZoom:true});
		map.on("load", function() {
			map.hideZoomSlider();
			map.enableScrollWheelZoom();
		});
		$("#login").click(function(){
			if (!$.trim($('#name').val()) || !$.trim($('#group').val())) {
				alert('Name is required. \nGroup is required.');
				return;
			}
			group = $('#group').val();
			username = $('#name').val();
			color = $('#color-text-field').val();
			$('#modal-login').modal('hide');
			myPosRef = new Firebase('https://odindb.firebaseio.com/Pos/' + group + '/' + username);
			groupPosRef = new Firebase('https://odindb.firebaseio.com/Pos/' + group);
			LoginOnFalcon();
		});
		function LoginOnFalcon(){
			if (navigator.geolocation) {
				  var options = {
					  enableHighAccuracy: true,
					  timeout: 5000,
					  maximumAge: 0
				  };
				  function success(pos) {
						var userPos = pos.coords;
						userPos.name = username;
						userPos.group = group;
						userPos.color = color;
						myPosRef.set(userPos);
						addPointsToMap()
				  };
				setInterval(function(){
					navigator.geolocation.getCurrentPosition(success, null, options)
				}, 5000);
			}
			else {
				alert("Geolocation not supported on your browser.");
			}
		}
		function addPointToMap(users) {
				$('#legendItens').empty();
				map.graphics.clear();
				for (item in users){
					user = users[item];
					var color = new dojo.Color(user.color).toRgba();
					color[3] = 0.5;
					var posRMK = esri.geometry.lngLatToXY(user.longitude, user.latitude);
					var attr = {"accuracy": user.accuracy, "group":user.group, 
						"latitude":user.latitude, "longitude": user.longitude, "name": user.name,
							"color": user.color};
					var infoTemplate = new esri.InfoTemplate($('#infoTemplateTitle').val(), 
						$('#infoTemplate').val());
					map.graphics.add(new esri.Graphic(
						new esri.geometry.Point(posRMK[0], posRMK[1], map.spatialReference),
						new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color(user.color))
						.setSize(8), attr, infoTemplate)
					);
					map.graphics.add(new esri.Graphic(
						new esri.geometry.Point(posRMK[0], posRMK[1], map.spatialReference),
							new esri.symbol.TextSymbol(user.name).setFont(
								new esri.symbol.Font().setSize('15pt').setFamily('verdana')
							).setAlign(esri.symbol.TextSymbol.ALIGN_START).setColor(color)
					));
					setLegend(user);
				}
		}
		function addPointsToMap(){
			groupPosRef.on('value', function(data) {
				addPointToMap(data.val());
			});
			if(firstTime){
				map.setExtent(esri.graphicsExtent(map.graphics.graphics), true);
				firstTime = false;
			}
		}
		function setLegend(user){
			$('#legendItens').append($('#legendTemplate').val().replace('#color#', user.color)
				.replace('#name#',user.name))
		}
	}
);
$(document).ready(function() {
	$('#color-text-field').minicolors( {
		changeDelay: 200, letterCase: 'uppercase',
		theme: 'bootstrap', defaultValue:'#'+Math.floor(Math.random()*16777215).toString(16)
	});
	dojo.setStyle(dojo.byId('color-text-field'), 'height', '28px');
	$('#name').val('Guest'+Math.floor((Math.random()*10000)+1));
	$('#modal-login').modal('show');
	$('#collapseOne').collapse("hide");
})