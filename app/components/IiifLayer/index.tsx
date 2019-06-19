// tslint:disable: max-classes-per-file

/**
 *
 * IiifLayer
 *
 */

import { withLeaflet, MapLayer } from 'react-leaflet';
import DistantIiif from './DistantLeafletLayer';
import LocalIiif from './LocalLeafletLayer';

export const DistantIiifLayer = withLeaflet(class DistantIiifLayer extends MapLayer<any, any> {
  public createLeafletElement(props) {
    return new (DistantIiif as any)(this.getOptions(props));
  }

  public updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      toProps.leafletElement.setUrl(toProps.url);
    }
  }
});

export const LocalIiifLayer = withLeaflet(class LocalIiifLayer extends MapLayer<any, any> {
  public createLeafletElement(props) {
    return new (LocalIiif as any)(this.getOptions(props));
  }

  public updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
  }
});
