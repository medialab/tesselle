/**
 *
 * IiifLayer
 *
 */

import { MapLayer, withLeaflet } from 'react-leaflet';
import Iiif from './LeafletLayer';

// import styled from 'styles/styled-components';

// interface OwnProps {}

class IiifLayer extends MapLayer<any> {
  public createLeafletElement(props) {
    return new (Iiif as any)(props.url, this.getOptions(props));
  }

  public updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      toProps.leafletElement.setUrl(toProps.url);
    }
  }
}

export default withLeaflet(IiifLayer);
