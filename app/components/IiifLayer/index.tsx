/**
 *
 * IiifLayer
 *
 */

import { withLeaflet, GridLayer } from 'react-leaflet';
import Iiif from './LeafletLayer';

class IiifLayer extends GridLayer<any, Iiif> {
  public createLeafletElement(props) {
    return new Iiif(this.getOptions(props));
  }

  public updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      toProps.leafletElement.setUrl(toProps.url);
    }
  }
}

export default withLeaflet(IiifLayer);
