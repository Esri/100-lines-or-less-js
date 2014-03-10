$(function() {
require([
    "esri/map","esri/graphic","esri/dijit/Directions","esri/layers/GraphicsLayer",
    "esri/symbols/SimpleLineSymbol","dojo/_base/Color",
    "dojo/on","dojo/number"], function(
    Map, Graphic, Directions, GraphLayer, SimpleLineSymbol, Color, on, num){
    $('#btnSolve').click(function(){
        showmehow($('#addressA').val(), $('#addressB').val());
    });
    $('#btnReset').click(function(){
        reset();
    })
    $('.next').click(function(){ctrlstep(++step, 1);});
    $('.back').click(function(){ctrlstep(--step, -1);});
    function showmehow(addressA, addressB){
        if(addressA == '' || addressB == '') {
            alert('Please enter with addresses'); return;
        }
        showMap(true);
        window.map = new Map("map", {
            basemap: "topo", sliderStyle: "small"
        });
        window.graphLayer = new GraphLayer();
        window.map.addLayer(window.graphLayer);
        window.directions = new Directions({
            map: map, routeTaskUrl:$('#routeUrl').val()});
        directions.on('load', function(){
            window.ar = 0;
            directions.updateStop(addressA, 0).then(function(e){ckresult();});
            directions.updateStop(addressB, 1).then(function(e){ckresult();});
        });
        directions.on('directions-finish', function(r) {
            if(r.result.code != undefined) {
                alert("Unable to resolve this route.");
                reset(); return;
            }
            window.resultRoute = r.result.routeResults[0].directions;
            ctrlstep(window.step = 1, 1);
        });
        directions.startup();
    }
    function ctrlstep(n, t) {
        if(window.resultRoute == undefined ||
            window.resultRoute.features[step] == undefined) {
            step = t == 1 ? step-- : step++; return;
        }
        graphLayer.clear();
        var ft = window.resultRoute.features[step];
        var mpath = 'assets/img/maneuvers/' + ft.attributes.maneuverType + ".png";
        $('#maneuvers').attr('src', mpath);
        $('#text').empty().append(ft.attributes.text+'<span class="ml"> ('+
            num.format(ft.attributes.length,{places:2})+' mi)</span>');
        var segSymbol = new SimpleLineSymbol().setColor(
            new Color([235,72,40,0.9])).setWidth(12);
        graphLayer.add(new Graphic(ft.geometry, segSymbol));
        map.setExtent(ft.geometry.getExtent(), true);
        $('#overlay').hide();
    }
    function ckresult(){
        if(++ar == 2) directions.getDirections();
    }
    function showMap() {
        $('#overlay').show();
        $('#find').hide();
        $('#result').show();
        $('footer').addClass('ft');
    }
    function reset() {
        $('#overlay').show();
        window.location.reload();
    }
});});
