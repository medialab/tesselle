import { GeoJSON as LeafletGeoJSON, Marker, FeatureGroup, Polyline, Polygon, Circle } from 'leaflet';
import { coordsToLatLng, coordsToLatLngs, asFeature } from 'utils/geo';

export default LeafletGeoJSON.extend({
  addData: function(geojson) {
    const features = Array.isArray(geojson) ? geojson : geojson.features;
    if (features) {
      for (const feature of features) {
        if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
          this.addData(feature);
        }
      }
      return this;
    }
    const options = this.options;

    if (options.filter && !options.filter(geojson)) {
      return this;
    }
    const layer = geometryToLayer(geojson, options);
    if (!layer) {
      return this;
    }
    layer.feature = asFeature(geojson);
    layer.defaultOptions = layer.options;
    this.resetStyle(layer);
    if (options.onEachFeature) {
      options.onEachFeature(geojson, layer);
    }

    return this.addLayer(layer);
  },
});

// @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
// Creates a `Layer` from a given GeoJSON feature. Can use a custom
// [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
// functions if provided as options.
export function geometryToLayer(geojson, options) {
  const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;
  const coords = geometry ? geometry.coordinates : null;
  const layers: any[] = [];
  const pointToLayer = options && options.pointToLayer;
  const callbackCoordsToLatLng = options && options.coordsToLatLng || coordsToLatLng;
  let latlng;
  let latlngs;

  if (!coords && !geometry) {
    return null;
  }

  switch (geometry.type) {
    case 'Point':
      latlng = callbackCoordsToLatLng(coords);
      return pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng);

    case 'MultiPoint':
      for (const coord of coords) {
        latlng = callbackCoordsToLatLng(coord);
        layers.push(
          pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng),
        );
      }
      return new FeatureGroup(layers);

    case 'LineString':
    case 'MultiLineString':
      latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, callbackCoordsToLatLng);
      return new Polyline(latlngs, options);

    case 'Polygon':
    case 'MultiPolygon':
      latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, callbackCoordsToLatLng);
      return new Polygon(latlngs, options);

    case 'GeometryCollection':
      for (const geom of geometry.geometries) {
        const layer = geometryToLayer({
          geometry: geom,
          type: 'Feature',
          properties: geojson.properties,
        }, options);
        if (layer) {
          layers.push(layer);
        }
      }
      return new FeatureGroup(layers);
    case 'Circle':
      latlngs = coordsToLatLng(coords);
      return new Circle(latlngs, {radius: geometry.radius});
    default:
      throw new Error('Invalid GeoJSON object.');
    }
}
