// Constants & State
const TLE_SOURCE       = 'https://celestrak.org/NORAD/elements/gp.php';
const SATELLITES       = [
  { id: 25544, name: 'International Space Station', color: 'red'    },
  { id: 20580, name: 'Hubble Space Telescope',       color: 'blue'   },
  { id: 33591, name: 'ESA Aeolus',                    color: 'green'  },
  { id: 38423, name: 'Starlink-1130',                color: 'purple' }
];
const ORBIT_SAMPLES    = 360;
const UPDATE_INTERVAL  = 5000; // ms

let map;
const markers          = {};   // satId → L.circleMarker
let currentOrbitLayers = [];   // array of L.Polyline segments

// 1) Initialize Leaflet map (locked, single-world view)
function initMap() {
  map = L.map('map', {
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false,
    keyboard: false,
    zoomControl: false,
    tap: false,
    worldCopyJump: false,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1,
    minZoom: 2,
    maxZoom: 2
  }).setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    noWrap: true
  }).addTo(map);
}

// 2) Fetch TLEs for our four sats
async function fetchTLEs() {
  await Promise.all(SATELLITES.map(async sat => {
    try {
      const url  = `${TLE_SOURCE}?CATNR=${sat.id}&FORMAT=TLE`;
      const txt  = await fetch(url).then(r => r.text());
      const [ , line1, line2 ] = txt.trim().split('\n');
      sat.tle1 = line1;
      sat.tle2 = line2;
    } catch (e) {
      console.error(`Failed TLE for ${sat.name}`, e);
    }
  }));
}

// 3) Sidebar list
function populateSatList() {
  const listEl = document.getElementById('sat-list');
  listEl.innerHTML = '';
  SATELLITES.forEach(sat => {
    const item = document.createElement('div');
    item.className   = 'sat-item';
    item.textContent = sat.name;
    item.onclick     = () => {
      drawOrbit(sat);
      const m = markers[sat.id];
      if (m) {
        map.panTo(m.getLatLng());
        m.openPopup();
      }
    };
    listEl.appendChild(item);
  });
}

// 4) Compute one full ground-track, unwrap longitudes, split across big jumps
function computeOrbitSegments(sat) {
  const satrec    = satellite.twoline2satrec(sat.tle1, sat.tle2);

  // <-- FIXED: satrec.no is in radians/minute, so one rev = 2π radians
  const periodMs  = (2 * Math.PI * 60 * 1000) / satrec.no;

  const now       = Date.now();
  let prevUnwrappedLon = null;
  const raw       = [];

  // build an unwrapped lon series
  for (let i = 0; i <= ORBIT_SAMPLES; i++) {
    const t    = new Date(now + (i * periodMs / ORBIT_SAMPLES));
    const pv   = satellite.propagate(satrec, t);
    const gmst = satellite.gstime(t);
    const geo  = satellite.eciToGeodetic(pv.position, gmst);
    const lat  = satellite.degreesLat(geo.latitude);
    let   lon  = satellite.degreesLong(geo.longitude);

    if (prevUnwrappedLon !== null) {
      let delta = lon - prevUnwrappedLon;
      if (delta > 180)  delta -= 360;
      if (delta < -180) delta += 360;
      lon = prevUnwrappedLon + delta;
    }
    prevUnwrappedLon = lon;
    raw.push([lat, lon]);
  }

  // wrap back into [-180,180] & break segments on >90° jumps
  const segments = [];
  let seg = [];

  raw.forEach(([lat, lon], i) => {
    lon = ((lon + 180) % 360 + 360) % 360 - 180;
    if (i > 0) {
      const prevLon = seg[seg.length - 1][1];
      if (Math.abs(lon - prevLon) > 90) {
        segments.push(seg);
        seg = [];
      }
    }
    seg.push([lat, lon]);
  });
  segments.push(seg);

  return segments;
}

// 5) Draw orbit — remove old, then draw each segment
function drawOrbit(sat) {
  currentOrbitLayers.forEach(l => map.removeLayer(l));
  currentOrbitLayers = [];

  if (!sat.tle1) return;
  const segs = computeOrbitSegments(sat);
  segs.forEach(path => {
    const pl = L.polyline(path, {
      color:   sat.color,
      weight:  3,
      opacity: 0.9
    }).addTo(map);
    currentOrbitLayers.push(pl);
  });
}

// 6) Update markers for all sats
function updatePositions() {
  const now = new Date();
  SATELLITES.forEach(sat => {
    if (!sat.tle1) return;
    const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    const pv     = satellite.propagate(satrec, now);
    const gmst   = satellite.gstime(now);
    const geo    = satellite.eciToGeodetic(pv.position, gmst);
    const lat    = satellite.degreesLat(geo.latitude);
    const lon    = satellite.degreesLong(geo.longitude);
    const popup  = `${sat.name}<br>Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;

    if (markers[sat.id]) {
      markers[sat.id]
        .setLatLng([lat, lon])
        .getPopup().setContent(popup);
    } else {
      markers[sat.id] = L.circleMarker([lat, lon], {
        radius:      6,
        color:       sat.color,
        fillColor:   sat.color,
        fillOpacity: 1,
        weight:      1
      })
      .addTo(map)
      .bindPopup(popup);
    }
  });
}

// 7) On load…
window.onload = async () => {
  initMap();
  await fetchTLEs();
  populateSatList();

  // draw ISS by default
  drawOrbit(SATELLITES[0]);

  updatePositions();
  setInterval(updatePositions, UPDATE_INTERVAL);
};
