// inspired by @jesolem, https://github.com/jesolem/mytown
$("#list-btn").click(function() {
    $("#aboutModal").modal("show");
    return false;
});

function placeNumber(value, row, index) {
    return 1 + index;
};

function linkUserName(value, row) {
    return '<a target="_blank" href="https://www.mapillary.com/profile/' + value + '">' + value + '</a>';
};

function panameReplace(value, row, index) {
    return JSON.stringify(value).replace(/","/g, ', ').slice(2, -2);
};

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFzdCIsImEiOiJjaW8yb2J5b3kwMHg3dnZseTNoZ2JkbXllIn0.bd3CWy4tlOrSgX3g_PPi_w';

if (!mapboxgl.supported()) {
    $("#warningModal").modal("show");
} else {
    console.log('Your browser supported Mapbox GL');
    $("#aboutModal").modal("show");
};

var pLocation = {
  "1": {
    center: [36.242377, 50.056827],
    p_key: '4PRDR8DUPLgDS7-hw6_utA'
  },
  "2": {
    center: [24.480444, 51.488236],
    p_key: '52i8_YjbKJWpPZmbHGZqlg'
  },
  "3": {
    center: [24.675317, 51.548634],
    p_key: 'QGWoGa28Dl9SGL3xWiznoQ'
  },
  "4": {
    center: [30.490125, 50.608115],
    p_key: 'z3DwyBh92-VCUikjaTdzNQ'
  },
  "5": {
    center: [23.846695, 51.481067],
    p_key: 'Q2oMm_qooLxBf_vbw3XZvw'
  }
};

function randomInteger(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
};

var locNumber = randomInteger(1, 5);

var center = pLocation[locNumber].center,
    p_key = pLocation[locNumber].p_key;
    
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v8',
    center: center,
    zoom: 4
});

map.addControl(new mapboxgl.Navigation({
    position: 'top-left'
}));

var markerSource = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: center
        },
        properties: {
            title: 'You\'re here!',
            'marker-symbol': 'marker'
        }
    }
};

var mapillarySource = {
    type: 'vector',
    tiles: ['https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox'],
    minzoom: 0,
    maxzoom: 16
};

map.on('style.load', function() {

    // GeoJSON PZF layer
    map.addSource('pzf', {
        'type': 'geojson',
        'data': 'data/pzf.geojson'
    });
    map.addLayer({
        'id': 'pzfId',
        'type': 'fill',
        'source': 'pzf',
        'layout': {},
        'paint': {
            'fill-color': '#9ace00',
            'fill-opacity': 0.3,
            'fill-outline-color': '#AED540',
        }
    });

    /*
    // label http://stackoverflow.com/questions/30531006/centering-text-label-in-mapbox-gl-js
    map.addSource('label', {
            'type': 'geojson',
            'data': 'data/point.geojson'
        });

        map.addLayer({
            'id': 'label-style',
            'type': 'symbol',
            'source': 'label',
            'layout': {
                'text-field': '{name}',
                'text-size': 8
            },
            'minzoom': 10,
            //'maxzoom': 21,
            //'filter': 18,
            'paint': {
                'text-color': 'red'
            }
        });
        */

    // mapillary sequences
    map.addSource('mapillary', mapillarySource);
    map.addLayer({
        'id': 'mapillary',
        'type': 'line',
        'source': 'mapillary',
        'source-layer': 'mapillary-sequences',
        'filter': [">", 'captured_at', '1451606400000'],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-opacity': 0.7,
            'line-color': '#E88D00',
            'line-width': 3
        }
    }, 'markers');

    // GeoJSON photos layer
    map.addSource('photos', {
        'type': 'geojson',
        'data': 'data/photo_point.geojson'
    });
    map.addLayer({
        'id': 'photos',
        'type': 'circle',
        'source': 'photos',
        'layout': {},
        'paint': {
            "circle-radius": 3,
            "circle-color": "#004C00",
            "circle-opacity ": 0.2
        }
    });

    // mapillary sequences label
    map.addLayer({
        'id': 'mapillary-label-style',
        'type': 'symbol',
        'source': 'mapillary',
        'source-layer': 'mapillary-sequences',
        'layout': {
            'text-field': '{username}',
            'symbol-placement': 'line',
            'text-size': 12
        },
        'minzoom': 10,
        'maxzoom': 21,
        'filter': [">", 'captured_at', '1451606400000'],
        'paint': {
            'text-color': '#3D30A9',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 1.5
        }
    });


    // photo position marker    
    map.addSource('markers', markerSource);
    map.addLayer({
        'id': 'markers',
        'type': 'symbol',
        'source': 'markers',
        'layout': {
            'icon-image': '{marker-symbol}-15',
            'text-field': '{title}',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top'

        },
        'paint': {
            'text-size': 12,
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 1.5
        }
    });

});

var mly = new Mapillary.Viewer('mly', 'WTlZaVBSWmxRX3dQODVTN2gxWVdGUTowNDlmNDBhNjRhYmM3ZmVl', p_key);

mly.on('nodechanged', function(node) {
    var lnglat = [node.latLon.lon, node.latLon.lat];
    var tempSource = new mapboxgl.GeoJSONSource({
        data: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: lnglat
            },
            properties: {
                title: 'You\'re here!',
                'marker-symbol': 'marker'
            }
        }
    });
    map.getSource('markers').setData(tempSource._data);
    map.flyTo({
        center: lnglat,
        zoom: 15
    });
});

map.on('click', function(e) {
    mly.moveCloseTo(e.lngLat.lat, e.lngLat.lng);
});