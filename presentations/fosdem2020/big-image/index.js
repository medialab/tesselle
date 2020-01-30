import 'leaflet/dist/leaflet.css';
import 'leaflet-responsive-popup/leaflet.responsive.popup.css';

import * as L from 'leaflet';

// import image from './biggest.jpg';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('file');
  const map = L.map('app', {
    cts: L.CRS.Simple,
  });
  input.addEventListener('change', () => {
    const file = input.files[0];
    const image = window.URL.createObjectURL(file);
    // const spaceBounds = {
    //   _southWest: {
    //     lat: -99.90625,
    //     lng: 0,
    //   },
    //   _northEast: {
    //     lat: 0,
    //     lng: 312.5,
    //   },
    // };
    // const bounds = spaceBounds;
    // const tabulaBounds = {
    //   _southWest: {
    //     lat: -23.0703125,
    //     lng: 0,
    //   },
    //   _northEast: {
    //     lat: 0,
    //     lng: 362.34375,
    //   },
    // };
    // const bounds = tabulaBounds;

    const bounds = [[0, 0], [50, 600]];

    L.imageOverlay(image, bounds).addTo(map);
    map.fitBounds(bounds);
  });
});
