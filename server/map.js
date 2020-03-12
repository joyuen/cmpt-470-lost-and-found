// This is the minimum zoom level that we'll allow
let minZoomLevel = 16;
// Track markers
let existing = {};

let testMarkers = [{id: 1, lat: 49.278871, lng: -122.916386, info: "Hello"},
               {id: 2, lat: 49.279340, lng: -122.922866, info: "World"}]

function getMarkers(n, s, w, e) {
    // TODO: Retrieve from DB
    var markers = testMarkers;
    let m = {}
    // Below for each loop should be a query to db
    markers.forEach(function(pos) {
        if (n > pos.lat && pos.lat > s && w < pos.lng && pos.lng < e) {
            m[pos.id] = pos;
        }
    });
    return m;
}

function initMap() {
    // GLOBALS

    // SFU Burnaby
    burnabyMinZoom = 16;
    burnabyCenter = new google.maps.LatLng(49.2767988, -122.9169812);
    burnabyBounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(49.272003, -122.933773),  // South West
         new google.maps.LatLng(49.282021, -122.902325)   // North East
    );

    // SFU Vancouver
    vancouverMinZoom = 18;
    vancouverCenter = new google.maps.LatLng(49.284526, -123.111648);
    vancouverBounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(49.284213, -123.113048),  // South West
         new google.maps.LatLng(49.285356, -123.111055)   // North East
    );

    // SFU Surrey
    surreyMinZoom = 17.5
    surreyCenter = new google.maps.LatLng(49.18665,-122.8494658);
    surreyBounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(49.185315, -122.852098),  // South West
         new google.maps.LatLng(49.190122, -122.845559)   // North East
    );

    map = new google.maps.Map(document.getElementById('map'), {
        disablePanMomentum: true,
        zoom: burnabyMinZoom,
        minZoom: burnabyMinZoom,
        center: new google.maps.LatLng(49.2767988, -122.9169812),
        restriction: {latLngBounds: burnabyBounds, strictBounds: false},
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        clickableIcons: false,
        styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "poi.school",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.government",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.medical",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.park",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.sports_complex",
                        "stylers": [{ "visibility": "on" }]
                    }
                ]
    });

    // Add controls to the map, allowing users to hide/show features.
    var styleControl = document.getElementById('floating-panel');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

    map.addListener('idle', function() {
        // This is only for testing, need to grab new coords from db from idle listener below
        var bounds = map.getBounds();
        neBounds = bounds.getNorthEast();
        swBounds = bounds.getSouthWest();
        var markers = getMarkers(neBounds.lat(), swBounds.lat(), swBounds.lng(), neBounds.lng());
        for(var key in existing) {
            if(!(key in markers)) {
                existing[key].setMap(null);
                delete existing[key];
            }
        }
        for(var key in markers) {
            if(key in existing) {
                continue;
            }
            let pos = markers[key];
            let m = new google.maps.Marker({
                position: new google.maps.LatLng(pos.lat, pos.lng),
                map: map,
            })
            existing[key] = m;
            let infowindow = new google.maps.InfoWindow({
              content: "<div>" + pos.info + "</div>"
            });

            m.addListener('click', function() {
                infowindow.open(map, m);
            })
        }
    });

    map.addListener('click', function(event) {
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: map,
        });

        marker.addListener('click', function() {
            marker.setMap(null);
        })
    });
}

function showBurnaby() {
    map.setOptions({center: burnabyCenter, zoom: burnabyMinZoom, minZoom: burnabyMinZoom, restriction: {latLngBounds: burnabyBounds, strictBounds: false}})
    map.setCenter(burnabyCenter);
    map.setZoom(burnabyMinZoom);
}

function showVancouver() {
    map.setOptions({center: vancouverCenter, zoom: vancouverMinZoom, minZoom: vancouverMinZoom, restriction: {latLngBounds: vancouverBounds, strictBounds: false}})
    map.setCenter(vancouverCenter);
}

function showSurrey() {
    map.setOptions({center: surreyCenter, zoom: surreyMinZoom, minZoom: surreyMinZoom, restriction: {latLngBounds: surreyBounds, strictBounds: false}})
    map.setCenter(surreyCenter);
}

// initMap();
// showBurnaby();

