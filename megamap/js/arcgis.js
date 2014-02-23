require(['esri/map', 'esri/graphic',
        'esri/symbols/Font', 'esri/symbols/TextSymbol', 'dojo/_base/array',
        'dojo/on', 'dojo/dom', 'dojo/dom-class',
        'dojo/_base/Color', 'dojo/domReady!'
],
function(Map, Graphic, Font, TextSymbol, arrayUtils, on, dom, domClass, Color) {
  var role, paths = {};
  var dataStore = new Firebase('https://blazing-fire-9567.firebaseIO.com/');
  var letters = 'abcdefg'.split('');
  var v_font = new Font('50pt', null, null, null, 'MegaManVillain');
  var h_font = new Font('50pt', null, null, null, 'MegaMan');
  var map = new Map('mapDiv', {
    basemap: 'topo',
    center: [-116.5380375,33.8262181],
    zoom: 17
  });
  var roles = {
    hero: function() {
      return new TextSymbol(character(), h_font, new Color([0,0,255]));
    },
    villain: function() {
      return new TextSymbol(character(), v_font, new Color([255,0,0]));
    }
  };
  function character() { return letters[Math.floor(Math.random()*(6))]; }
  function asId(geom) {
    return [geom.x.toString(), geom.y.toString()].join('')
      .replace(/\./g,'').replace(/-/g,'');
  }
  function parseData(snapshot) {
    var g, data = snapshot.val();
    arrayUtils.forEach(map.graphics.graphics, function(gr) {
      if (gr.attributes && gr.attributes.id === data.id) {
        g = gr;
      }
    });
    if (g) { map.graphics.remove(g); }
    paths[data.id] = snapshot.name();
    if (data.attributes && data.attributes.count < 5) {
      map.graphics.add(new Graphic(data));
    } else {
      dataStore.child(snapshot.name()).set(null);
    }
  }
  var onHero = on.once(dom.byId('map-hero'), 'click', function(e) {
    onVill.remove();
    domClass.add(e.target, 'active');
    role = 'hero';
  });
  var onVill = on.once(dom.byId('map-villain'), 'click', function(e) {
    onHero.remove();
    domClass.add(e.target, 'active');
    role = 'villain';
  });
  dataStore.on('child_changed', parseData);
  dataStore.on('child_added', parseData);
  map.on('click', function(e) {
    if (!role) {
      alert('Choose a side!');
      return;
    }
    var data;
    if (e.graphic) {
      var attr = e.graphic.attributes;
      var type = attr.type;
      if (type === 'hero' && role === 'villain') {
        attr.type = 'villain';
        e.graphic.setSymbol(roles.villain());
      } else if (type === 'villain' && role === 'hero') {
        attr.type = 'hero';
        e.graphic.setSymbol(roles.hero());
      }
      if (type !== attr.type) {
        e.graphic.attributes.count++;
        data = e.graphic.toJson();
        data.id = asId(e.graphic.geometry);
        dataStore.child(paths[data.id]).set(data);
      }
    } else {
      var g = new Graphic(e.mapPoint, roles[role](), {
        id: asId(e.mapPoint),
        type:role,
        count: 1
      });
      map.graphics.add(g);
      data = g.toJson();
      data.id = asId(g.geometry);
      dataStore.push(data);
    }
  });
});
