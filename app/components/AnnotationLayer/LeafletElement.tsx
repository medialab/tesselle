import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { Marker, FeatureGroup, Polyline, Circle } from 'leaflet';
import { coordsToLatLng, coordsToLatLngs } from 'utils/geo';

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
      return (
        <Polygon positions={latlngs.toJS()}>
          <Tooltip opacity={1} permanent>
            {geojson.properties.content}
          </Tooltip>
        </Polygon>
      );

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
