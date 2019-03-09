/**
 *
 * AnnotationLayer
 *
 */

import { withLeaflet, Path, PathProps } from 'react-leaflet';
import { Feature } from 'geojson';
import LeafletGeoJSON from './LeafletElement';

interface OwnProps extends PathProps {
  data: Feature[];
}

class AnnotationLayer extends Path<OwnProps, any> {
  public createLeafletElement(props) {
    return new (LeafletGeoJSON as any)(props.data, this.getOptions(props));
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
