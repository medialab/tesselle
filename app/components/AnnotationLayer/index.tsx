/**
 *
 * AnnotationLayer
 *
 */

import { withLeaflet, Path, PathProps } from 'react-leaflet';
import { Feature } from 'geojson';
import Annotation from 'types/Annotation';
import { Set } from 'immutable';
import LeafletGeoJSON from './LeafletElement';

interface OwnProps extends PathProps {
  data: Set<Annotation>;
  style: (feature: Feature) => any;
  onEachFeature: (feature: Feature, layer: L.Layer) => any;
}

class AnnotationLayer extends Path<OwnProps, any> {
  public createLeafletElement(props) {
    this.leafletElement = new (LeafletGeoJSON as any)({
      type: 'FeatureCollection',
      features: props.data.toJS(),
    }, this.getOptions(props));
    return this.leafletElement;
  }

  public updateLeafletElement(fromProps, toProps) {
    if (typeof toProps.style === 'function') {
      this.setStyle(toProps.style);
    } else {
      this.setStyleIfChanged(fromProps, toProps);
    }
  }
}

export default withLeaflet(AnnotationLayer);
