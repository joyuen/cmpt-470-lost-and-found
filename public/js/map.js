// This is the minimum zoom level that we'll allow
let minZoomLevel = 16;
// Track markers
let existing = {};
let postings = {};

let testMarkers = [{id: 1, lat: 49.278871, lng: -122.916386, info: "Hello"},
               {id: 2, lat: 49.279340, lng: -122.922866, info: "World"}]

var currentMarker;
var pannedMarker;
var currentPosting;

// Track current campus
var currentCampus;

function showPage(id) {
    var otherpages = document.getElementById("content").children;
    for (let elem of otherpages) {
        if (elem.id == id) {
            elem.className = "selected";
        } else {
            elem.className = "not-selected";
        }
    }

    if (id != "content-form") {
        if (currentMarker) {
            currentMarker.setMap(null);
        }
        var overlay = document.getElementById('overlay');
        overlay.style.display = "none";
    }

    if (pannedMarker) {
        pannedMarker.setIcon(undefined);
    }
}

function panToMarker(key) {
    let m = existing[key];
    let p = postings[key];
    currentPosting = key
    map.panTo(m.position);
    showPage("content-post");
    document.getElementById('post-title').innerHTML = p.title;
    document.getElementById('post-status').innerHTML = "Status: " + p.status;
    document.getElementById('post-item').innerHTML = "Item: " + p.category;
    document.getElementById('post-date').innerHTML = p.lostDate;
    document.getElementById('post-author').innerHTML = "Posted by: " + p.postedBy;
    document.getElementById('post-link').href = "/viewpost?id="+p._id;

    m.setIcon("/images/map-marker-blue.png");
    pannedMarker = m;
}

async function getMarkers(n, s, w, e) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var response = req.responseText;
                var json = JSON.parse(response);
                dict = {}
                for(var r in json) {
                    dict[json[r]._id] = json[r];
                }
                setMarkers(dict);
                resolve();
            }
        };
        req.open('POST', location.origin + "/api/region");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var data = "n="+n+"&s="+s+"&w="+w+"&e="+e;
        req.send(data);
    });
}

function setMarkers(markers) {
    postings = markers;

    for(let key in existing) {
        if(!(key in markers)) {
            existing[key].setMap(null);
            delete existing[key];
        }
    }
    for(let key in markers) {
        if(key in existing) {
            continue;
        }
        let pos = markers[key].coordinates.coordinates;
        let m = new google.maps.Marker({
            position: new google.maps.LatLng(pos[1], pos[0]),
            map: map,
        })
        existing[key] = m;

        m.addListener('click', function() {
            panToMarker(key);
            // map.panTo(m.position);
            // showPage("content-post");
            // document.getElementById('post-title').innerHTML = markers[key].title;
            // document.getElementById('post-status').innerHTML = "Status: " + markers[key].status;
            // document.getElementById('post-item').innerHTML = "Item: " + markers[key].category;
            // document.getElementById('post-date').innerHTML = markers[key].lostDate;
            // document.getElementById('post-author').innerHTML = "Posted by: " + markers[key].postedBy;
            // document.getElementById('post-link').href = "/viewpost?id="+markers[key]._id;
        })
    }
};

function initMap() {
    // GLOBALS
    campuses = {
        burnaby: {              // SFU Burnaby
            minZoom: 16,
            center: new google.maps.LatLng(49.2767988, -122.9169812),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.272003, -122.933773),  // South West
                new google.maps.LatLng(49.282021, -122.902325)   // North East
            )
        },
        vancouver: {            // SFU Vancouver
            minZoom: 18,
            center: new google.maps.LatLng(49.284526, -123.111648),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.284213, -123.113048),  // South West
                new google.maps.LatLng(49.285356, -123.111055)   // North East
            )
        },
        surrey: {               // SFU Surrey
            minZoom: 17.5,
            center: new google.maps.LatLng(49.18665,-122.8494658),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.185315, -122.852098),  // South West
                new google.maps.LatLng(49.190122, -122.845559)   // North East
            )
        }
    }

    // SFU Burnaby
    // burnabyMinZoom = 16;
    // burnabyCenter = new google.maps.LatLng(49.2767988, -122.9169812);
    // burnabyBounds = new google.maps.LatLngBounds(
    //      new google.maps.LatLng(49.272003, -122.933773),  // South West
    //      new google.maps.LatLng(49.282021, -122.902325)   // North East
    // );

    // // SFU Vancouver
    // vancouverMinZoom = 18;
    // vancouverCenter = new google.maps.LatLng(49.284526, -123.111648);
    // vancouverBounds = new google.maps.LatLngBounds(
    //      new google.maps.LatLng(49.284213, -123.113048),  // South West
    //      new google.maps.LatLng(49.285356, -123.111055)   // North East
    // );

    // // SFU Surrey
    // surreyMinZoom = 17.5
    // surreyCenter = new google.maps.LatLng(49.18665,-122.8494658);
    // surreyBounds = new google.maps.LatLngBounds(
    //      new google.maps.LatLng(49.185315, -122.852098),  // South West
    //      new google.maps.LatLng(49.190122, -122.845559)   // North East
    // );

    map = new google.maps.Map(document.getElementById('map'), {
        disablePanMomentum: true,
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

    // map.addListener('idle', function() {
    //     // This is only for testing, need to grab new coords from db from idle listener below
    //     var bounds = map.getBounds();
    //     neBounds = bounds.getNorthEast();
    //     swBounds = bounds.getSouthWest();

    //     getMarkers(neBounds.lat(), swBounds.lat(), swBounds.lng(), neBounds.lng());

    // });

    map.addListener('click', function(event) {
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: map,
          icon: "images/map-marker-orange.png",
        });
        currentMarker = marker;

        showPage("content-form");
        document.getElementById("campus").value = currentCampus;
        document.getElementById("lat").value = event.latLng.lat();
        document.getElementById("lng").value = event.latLng.lng();
        //Set the attributes
        // form.className = "selected";
        // var allpost = document.getElementById("all-post");
        // var contentpost = document.getElementById("content-post");
        // allpost.className = "not-selected";
        // contentpost.className = "not-selected";
        var form = document.getElementById("content-form");
        form.onclick = function() {
            var overlay = document.getElementById('overlay')
            overlay.style.display = "block";
            overlay.style.left = document.getElementById('sidebar').offsetWidth + "px";
            overlay.style.width = document.getElementById('map').offsetWidth + "px";
            // var f = function() {
            //     overlay.style.display = "none";
            //     overlay.removeEventListener("click", f);
            //     marker.setMap(null);
            //     showPage("all-post");
            //     // form.className = "not-selected";
            //     // allpost.className = "selected";
            // }
            // overlay.addEventListener("click", f);
            form.onclick = function() {};
        };

        marker.addListener('click', function() {
            if(marker) {
                marker.setMap(null);
            }
        });

        var listener = map.addListener('click', function() {
            marker.setMap(null);
            google.maps.event.removeListener(listener);
        });

        var overlay = document.getElementById('overlay');
        overlay.addEventListener("click", function() {
            overlay.style.display = "none";
            marker.setMap(null);
            showPage("all-post");
        });
    });

    showCampus('burnaby');
}

async function showCampus(c) {
    map.setOptions({
        center: campuses[c].center,
        zoom: campuses[c].minZoom,
        minZoom: campuses[c].minZoom,
        restriction: {latLngBounds: campuses[c].bounds, strictBounds: false}}
    );
    map.setCenter(campuses[c].center);
    map.setZoom(campuses[c].minZoom);
    currentCampus = c;

    var bounds = campuses[c].bounds;
    var neBounds = bounds.getNorthEast();
    var swBounds = bounds.getSouthWest();

    await getMarkers(neBounds.lat(), swBounds.lat(), swBounds.lng(), neBounds.lng());
}

function showBurnaby() {
    // map.setOptions({center: burnabyCenter, zoom: burnabyMinZoom, minZoom: burnabyMinZoom, restriction: {latLngBounds: burnabyBounds, strictBounds: false}})
    // map.setCenter(burnabyCenter);
    // map.setZoom(burnabyMinZoom);
    // campus = "burnaby";
    showCampus('burnaby');
}

function showVancouver() {
    // map.setOptions({center: vancouverCenter, zoom: vancouverMinZoom, minZoom: vancouverMinZoom, restriction: {latLngBounds: vancouverBounds, strictBounds: false}})
    // map.setCenter(vancouverCenter);
    // map.setZoom(vancouverMinZoom);
    // campus = "vancouver";
    showCampus('vancouver');
}

function showSurrey() {
    // map.setOptions({center: surreyCenter, zoom: surreyMinZoom, minZoom: surreyMinZoom, restriction: {latLngBounds: surreyBounds, strictBounds: false}})
    // map.setCenter(surreyCenter);
    // map.setZoom(surreyMinZoom);
    // campus = "surrey";
    showCampus('surrey');
}

$(document).ready(function() {
    $(".cancel-button").on('click', function(e) {
        showPage("all-post");
        e.stopPropagation();    // otherwise it'll propagate to the form and show the overlay
    });
});

$(document).ready(function() {
    $(".edit-button").on('click', function(e) {
        var post = postings[currentPosting];
        showPage("content-form");
        document.getElementById("campus").value = currentCampus;
        document.getElementById("lng").value = post.coordinates.coordinates[0];
        document.getElementById("lat").value = post.coordinates.coordinates[1];
        document.getElementById("postid").value = currentPosting;
        document.getElementById("title").value = post.title;
        document.getElementById("location").value = post.location;
        document.getElementById("detail").value = post.description;
        document.getElementById("item").value = post.category;

        var lostdate = moment(post.lostDate);
        document.getElementById("date").value = lostdate.format('YYYY-MM-DD');
        document.getElementById("time").value = lostdate.format('hh:mm');
        document.getElementById("timezone-offset").value = moment().format('ZZ');

        e.stopPropagation();    // otherwise it'll propagate to the form and show the overlay
    });
});
