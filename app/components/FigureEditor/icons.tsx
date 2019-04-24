import * as L from 'leaflet';

// tslint:disable-next-line: max-line-length
const icon1 = '<?xml version="1.0" ?><svg id="Layer_1" style="enable-background:new 0 0 100 100;" version="1.1" viewBox="0 0 100 100" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><style type="text/css">.st0{fill:#FFFFFF;}.st1{fill:#1B1464;}.st2{fill:#C1272D;}.st3{fill:none;}</style><g><g><path class="st1" d="M50,6C25.7,6,6,25.7,6,50s19.7,44,44,44s44-19.7,44-44S74.3,6,50,6z M50,75c-13.8,0-25-11.2-25-25    s11.2-25,25-25s25,11.2,25,25S63.8,75,50,75z"/></g></g><path class="st2" d="M50,31c-10.5,0-19,8.5-19,19s8.5,19,19,19s19-8.5,19-19S60.5,31,50,31z"/></svg>';
// tslint:disable-next-line: max-line-length
const icon2 = '<?xml version="1.0" ?><svg id="Layer_1" style="enable-background:new 0 0 100 100;" version="1.1" viewBox="0 0 100 100" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><style type="text/css">.st0{fill:#FFFFFF;}.st1{fill:#1B1464;}.st2{fill:#2f6294;}.st3{fill:none;}</style><g><g><path class="st1" d="M50,6C25.7,6,6,25.7,6,50s19.7,44,44,44s44-19.7,44-44S74.3,6,50,6z M50,75c-13.8,0-25-11.2-25-25    s11.2-25,25-25s25,11.2,25,25S63.8,75,50,75z"/></g></g><path class="st2" d="M50,31c-10.5,0-19,8.5-19,19s8.5,19,19,19s19-8.5,19-19S60.5,31,50,31z"/></svg>';

export const iconMarker = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + window.btoa(icon1),
  iconSize: [20, 20],
  className: 'iconMarker',
});

export const iconMarkerNotActive = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + window.btoa(icon2),
  iconSize: [10, 10],
  className: 'iconMarker',
});
