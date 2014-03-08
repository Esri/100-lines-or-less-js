dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.addOnLoad(function () {
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	this.model = new (Backbone.Model.extend({}))();
	this.model.on('change', this.toggleShare, this);
	this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 255, 0, 0.25]));
	this.map = new esri.Map('map', {basemap: 'osm', center: [-98.737039, 38.737039], zoom: 4 });
	$('.current-location').on('click',function() { $this.getLocation($this.model) });
	$('#search-input').on('typeahead:selected', function (evt, datum, name) {
		$this.map.centerAndZoom(new esri.geometry.Point(datum.lon, datum.lat), 15);
		$('#search-modal').modal('hide');
	});
	$('#dev-summit').on('click',function() { $this.map.centerAndZoom([-116.5382, 33.8260], 16)});
	this.fb.on('value', function (ss) {
		$this.messages = [];
		_.each(ss.val(), function (item) { _.each(item.messages, function (item2) {
				$this.messages.push(item2) });
		});
		$this.displayChatMessages() & $this.activateClickListener() & $this.initTypeahead();
	});
},
events: {
	'keyup #message-input': 'toggleShare',	'keyup #name-input': 'toggleShare',
	'click .share-message': 'saveMsg',	'click #add-event-btn': 'enableEventClickHandler'
},
toggleShare: function (model) {
	$('#loader').modal('hide');
	if ($('#name-input').val() && $('#message-input').val() && (this.model.get('loc'))) {
		$('.share-message').removeClass('disabled');
	} else { $('.share-message').addClass('disabled') };
},
saveMsg: function (evt) {
	var loc = this.model.get('loc');
	var exists; var tC = new Date().getTime();
	var name = $('#name-input').val(); var text = $('#message-input').val();
	if (!name || !text) { $('#alert-modal').modal(); return; }
	if (!loc || !loc.lat || !loc.lon) {	$('#no-location-modal').modal(); return; };
	this.fb.on('value', function (ss) {	exists = (ss.val() !== null) });
	if(!exists){ this.fb.child(name).set({text: name}) };
	this.fb.child(name).child('messages').push({ name: name, text: text,
			lat: loc.lat, lon: loc.lon, timeStamp: tC });
	$('#share-modal').modal('hide'); $('#message-input').val(''); this.model.set('loc', null);
},getLocation: function (model) {
	if (navigator.geolocation) {
		$('#loader').modal({show: true, backdrop: false});
		navigator.geolocation.getCurrentPosition(function (p) {
			model.set('loc', null);
			model.set('loc', {lat: String(p.coords.latitude), lon: String(p.coords.longitude)});
		});
	} else { $('#alert-modal').modal(); }
},enableEventClickHandler: function() {
	if (this.mch){ dojo.disconnect(this.mch) };
	this.mch = dojo.connect(this.map, 'onClick', dojo.hitch(this, this.onMapClick));
	$('#share-modal').modal('hide');
},onMapClick: function (evt) {
	var x = esri.geometry.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y, true);
	this.model.set('loc', { lat: x[1], lon: x[0] });
    dojo.disconnect(this.mch) & $('#share-modal').modal('show');
},activateClickListener: function() {
	var $this = this;
	$('.chat-item').on('click', function(evt) {
		var d = evt.currentTarget.dataset;
		$this.map.centerAndZoom(new esri.geometry.Point(d.lon, d.lat), 15);
		$('#chat-modal').modal('hide');
	});
},displayChatMessages: function() {
	var $this = this; $('#chat-container').empty();
	this.messages.sort(function (a, b) { if (a.timeStamp > b.timeStamp) { return 1; }
		if (a.timeStamp < b.timeStamp) { return -1; } return 0;
	});
	_.each(this.messages, function (msg) {
	var tC = new Date().getTime();
	tE = Math.floor((tC - msg.timeStamp) / 1000 / 60); //get time elapsed since the previous messages in firebase
	tS = (tE > 60) ? Math.floor((tE * 60) / 3600)  + ' hours ago' :  tE + ' minutes ago';
	$('<li class="list-group-item chat-item"></li>').append('<div class="chat-date">' +
		msg.name +':  '+ tS +  '</div><div>'+ msg.text + '</div>')
		.attr('data-lat', msg.lat).attr('data-lon',msg.lon).prependTo($('#chat-container'));
	if (msg.lat && msg.lon && $this.map.graphics) {
		var pt = new esri.geometry.Point(msg.lon, msg.lat);
		var g = new esri.Graphic(pt, $this.symbol);
		$this.map.graphics.add(g);
	};
    g.setInfoTemplate(new esri.InfoTemplate().setTitle(msg.name +' '+ tS).setContent(msg.text));
});
},initTypeahead: function () {
	$('#search-input').typeahead('destroy');
	var bloodhound = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.text); },
		queryTokenizer: Bloodhound.tokenizers.whitespace, local: this.messages });
	bloodhound.initialize();
    var options = {	displayKey: 'text',	source: bloodhound.ttAdapter(),
        	templates: { suggestion: _.template('<strong><%=text%></strong>')}};
    $('#search-input').typeahead(null, options);
}});
new AppView();});
