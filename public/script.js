// make the map
let map = L.map("mapid", {
  center: [45.55, -122.65], // latitude, longitude in decimal degrees (find it on Google Maps with a right click!)
  zoom: 4, // can be 0-22, higher is closer
  scrollWheelZoom: false // don't zoom the map on scroll
});
// add the basemap tiles
L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png" // stamen toner tiles
).addTo(map);

/* EVENT HANDLERS
   Event handlers are functions that respond to events on the page. These are
   defined first so they can each be attached to the data layer and triggered on
   specific events.
*/

let geojson; // this is global because of resetHighlight

// change style
function highlightFeature(e) {
  let layer = e.target; // highlight the actual feature that should be highlighted
  layer.setStyle({
    weight: 3, // thicker border
    color: "#000", // black
    fillOpacity: 0.3 // a bit transparent
  });
}

// reset to normal style
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// zoom to feature (a.k.a. fit the bounds of the map to the bounds of the feature
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// attach the event handlers to events
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature, // a.k.a. hover
    mouseout: resetHighlight, // a.k.a. no longer hovering
    click: zoomToFeature // a.k.a. clicking
  });
}

let deviceLocation={};
function getCurrentLocation(){
  if (navigator.geolocation) {
    let currentLocation = navigator.geolocation.getCurrentPosition((position)=>{
      console.log(position.coords.latitude, position.coords.longitude);
      deviceLocation.lat = position.coords.latitude;
      deviceLocation.long = position.coords.longitude;
      map.panTo(new L.LatLng(deviceLocation.lat,deviceLocation.long));
      L.marker([deviceLocation.lat,deviceLocation.long], {icon:blackIcon}).addTo(layerGroup)

    });
  } else {
    console.log("No position");
  }
}

getCurrentLocation();

//
let layerGroup = L.layerGroup().addTo(map);

//socket
let socket = io();

socket.on('ipInfo', function(data) {
  // console.log("data: ", data)
  data[0].lat = deviceLocation.lat;
  data[0].long = deviceLocation.long;
  layerGroup.clearLayers();
  map.panTo(new L.LatLng(data[0].lat,data[0].long));
  let lineMap = [];
  let hopCount = 0;
  data.forEach((ip)=>{
    // console.log([ip.lat, ip.long])
    // console.log(ip)
    lineMap.push([ip.lat,ip.long]);
    let popup= L.popup()
      .setLatLng([ip.lat,ip.long])
      .setContent(`<strong>Hop: </strong> ${hopCount.toString()}<br />
      <strong>IPv4:</strong> ${ip.ipaddr.toString()}<br />
      <strong>City:</strong> ${ip.city.toString()}`)
    L.marker([ip.lat,ip.long], {icon: blackIcon})
      .on('mouseover', function (){this.openPopup()})
      .on('mouseout', function(){this.closePopup()})
      .on('click', onClick)
      .addTo(layerGroup)
      .bindPopup(popup)
    hopCount++;
  })
  let polyline = L.polyline(lineMap).addTo(layerGroup);
  polyline.setStyle({
      color: 'black'
  });
});

var blackIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// on Click Compass
function onClick(e){
  let serverCoord = this.getLatLng();
  let bearing = turf.bearing([deviceLocation.long, deviceLocation.lat], [serverCoord.lng,serverCoord.lat])
  let direction = "hi"
  console.log(bearing)

  if(bearing >=-180 && bearing < -157.5){
    direction = "S"
  } else if (bearing >=-157.5 && bearing < -112.5){
    direction = "SW"
  } else if (bearing >=-112.5 && bearing < -67.5){
    direction = "W"
  } else if (bearing >=-67.5 && bearing < -22.5){
    direction = "NW"
  } else if (bearing >=-22.5 && bearing < 22.5){
    direction = "N"
  } else if (bearing >=22.5 && bearing < 67.5){
    direction = "NE"
  } else if( bearing >=67.5 && bearing < 112.5){
    direction = "E"
  } else if( bearing >=157.5 && bearing < 180){
    direction = "S"
  }
  console.log(direction);

  //direction
  // NW -45    -67.5   - -22.5 
  // N   0     -22.5   -  22.5
  // NE 45      22.5   -  67.5
  // E  90      67.6   -  112.5 
  // SE 145     112.5  - 157. 5
  // S  180     157.5  - 180
  // SW -145    -112.5 - -157.5
  // W  -90     -67.5  -  -112.5


  $("span#Bear").html(direction);

  let distance = turf.distance([deviceLocation.long, deviceLocation.lat], [serverCoord.lng,serverCoord.lat])
  console.log(distance)
  $("span#Dist").html(`${distance} km`)
}
