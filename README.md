# Satellite Tracker Web App

### Description

A browser-based satellite tracker that fetches real-time orbital data from a public API, computes positions using the satellite.js library, and displays satellites on an interactive Leaflet map. Users can select satellites from a list, view their current latitude/longitude, and see when they will next pass overhead.

### Features (Unique Requirements)

* Display output to the screen via DOM updates and the Leaflet map.
* Use native ES6 array functions to process satellite lists.
* Recursively update satellite positions at a fixed interval.
* Integrate two external libraries via CDN: satellite.js and Leaflet.

### Stretch Challenge

* Demonstrate throwing and handling exceptions when API calls fail.

### File Structure

```
satellite-tracker/
├── index.html
├── script.js
└── README.md
```

### Installation & Setup

1. Clone the repository:
   ```
   git clone https://github.com/USERNAME/satellite-tracker.git
   cd satellite-tracker
   ```
2. No build step needed—just open index.html in a modern browser.

### Usage

* Open index.html in your browser.
* The map loads and the satellite list populates.
* Click a satellite name to center the map and display its orbit data.
* Positions auto-update every 5 seconds.
