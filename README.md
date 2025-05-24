# Overview

I wanted to grow my understanding of modern JavaScript by building a real-time satellite tracker. This project leverages core language features—such as ES6 array methods, asynchronous functions, and structured error handling—while integrating external APIs and libraries to deliver an interactive geospatial visualization.

This is a web application fetches live Two-Line Element (TLE) data, computes orbital positions using the satellite.js library, and renders satellite ground-tracks and current locations on a Leaflet map directly in the browser.

My goal in writing this software was to apply advanced JavaScript syntax and asynchronous programming patterns in a practical context, reinforcing my learning through a hands-on project.

[Software Demo Video](https://youtu.be/FeVPtO48guk)

# Development Environment

I used Visual Studio Code as my primary editor and relied on the browser’s developer tools for real-time debugging and network inspection. No build tools or bundlers were required—everything runs client-side.

* **Language:** JavaScript (ES6+)
* **Libraries:**
  * [satellite.js](https://github.com/shashwatak/satellite-js) (via CDN)
  * [Leaflet](https://leafletjs.com/) (via CDN)

# Useful Websites

* [MDN Web Docs: JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [Leaflet Documentation]()
* [satellite.js GitHub](https://github.com/shashwatak/satellite-js)
* [CelesTrak TLE Data](https://celestrak.org/)

# Future Work

* Allow users to search and add custom satellites by NORAD ID.
* Optimize performance by caching computed orbit paths and reducing redraw frequency.
* Enhance mobile responsiveness and improve touch interactions.
* Add UI controls for selecting map styles and projection options.
