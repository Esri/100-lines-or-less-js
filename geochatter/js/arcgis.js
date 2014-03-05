require(["esri/map","esri/geometry/webMercatorUtils","esri/InfoTemplate","esri/graphic",
  "esri/symbols/PictureMarkerSymbol","esri/layers/GraphicsLayer","esri/geometry/Point", "dojo/domReady!"
  ], function(Map, webMercatorUtils, InfoTemplate, Graphic, PictureMarkerSymbol, GraphicsLayer, Point) {
  var map = new Map("map", {
    center: [-56.049, 38.485],
    zoom: 3,
    basemap: "topo"
  });
  map.on("load", function() {
    map.hideZoomSlider();
  });
  map.infoWindow.highlight = false;

  var infoTemplate = new InfoTemplate("${name}","${message}");
  var symbol = new PictureMarkerSymbol('css/pushpin.png', 42, 42);

  $(".dropdown-img, .dropdown-img-top").click(function() {
     $(".messages-top-level").slideToggle();
     map.infoWindow.hide();
     _scrollBottom();
     return false;
  });
  var url = 'https://goinstant.net/7881544676e1/my-application';
  var room,user,messagesKey,lat,lng;
  var $name = $('.name');
  var $text = $('.text');
  var $messages = $('.messages');
  navigator.geolocation.getCurrentPosition(updatePosition);
  var connect = goinstant.connect(url);
  connect.then(function(result) {
    room = result.rooms[0];
    messagesKey = room.key('messages-esri');
    return room.self().get();
  }).then(function(result) {
    user = result.value;
    $name.val(user.displayName);
    return messagesKey.get();
  }).then(function(result) {
    var messages = result.value;
    var ordered = _.keys(messages).sort();
    _.each(ordered, function(id) {
      addMessage(messages[id], true);
    });
  }).fin(function() {
    var options = { local: true, listener: addMessage };
    messagesKey.on('add', options);
    $text.on('keydown', handleMessage);
    $name.on('keydown blur', handleName);
  });

  function addMessage(message, isLoad) {
    map.infoWindow.hide();
    var $message = $('<li><div class="user-name"></div><div class="user-message"></div></li>');
    $message.addClass('message');
    $message.children().first().text(message.name);
    $message.children().last().text(message.text);
    $messages.append($message);
    $text.val('');
    _scrollBottom();
    addGraphic(message.lat, message.lng, message.text, message.name, isLoad);
  }

  function updatePosition(position) {
    lat = position.coords.latitude; lng = position.coords.longitude;
  }

  function addGraphic(lat, lng, message, name, loading) {
    if ((lat === null || lng === null) || (loading != null && loading === true)) return;
    var point = new Point({"x": lng, "y": lat, "spatialReference": {"wkid": 4326 } });
    var attributes = {'name': name,'message': message};
    map.graphics.add(new Graphic(point, symbol, attributes, infoTemplate));
    map.infoWindow.setTitle(name);
    map.infoWindow.setContent(message);
    map.infoWindow.show(point);
    map.centerAt(point);
  }

  function handleMessage(event) {
    if (event.which !== 13) { return; }
    var message = { name: $name.val(), text: $text.val(), lat: lat, lng: lng };
    if (message.name === '' || message.text === '') { return; }
    messagesKey.add(message);
  }

  function handleName(event) {
    if (event.which !== 13 && event.type === 'keydown')  { return; }
    var name = $name.val();
    if (user.displayName === name) { return; }
    room.self().key('displayName').set(name);
    user.displayName = name;
  }

  function scrollBottom() {
    var properties = { scrollTop: $messages[0].scrollHeight };
    $messages.animate(properties, 'slow');
  }
  var _scrollBottom = _.debounce(scrollBottom, 100);
});