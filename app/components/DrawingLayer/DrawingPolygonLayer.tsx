import { withLeaflet, PolygonProps, Path } from 'react-leaflet';
import L from 'leaflet';

export const DrawingPolygonLayer = withLeaflet(class DrawingPolygonLayer extends Path<PolygonProps, L.Path> {
  public createLeafletElement(props) {
    const el = props.map.editTools.startPolygon();
    el.on('editable:drawing:end', () => {
      const feature = el.toGeoJSON();
      if (feature.geometry.coordinates[0][0]) {
        props.onDrown(el.toGeoJSON());
      }
    });
    return el;
  }
});
