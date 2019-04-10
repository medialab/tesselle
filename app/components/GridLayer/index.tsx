/**
 *
 * GridLayer
 *
 */

import * as React from 'react';
import L from 'leaflet';
import { MapLayer, withLeaflet } from 'react-leaflet';

const DebugCoords = L.GridLayer.extend({
  createTile: (coords) => {
    const tile = document.createElement('div');
    tile.innerHTML = [coords.x, coords.y, coords.z].join(', ');
    tile.style.outline = '1px solid red';
    return tile;
  },
});

class GridLayer extends MapLayer<any> {
  public createLeafletElement(props) {
    return new (DebugCoords as any)(this.getOptions(props));
  }
  public updateLeafletElement(fromProps, toProps) {
    const { opacity, zIndex } = toProps;
    if (opacity !== fromProps.opacity) {
      (this.leafletElement as any).setOpacity(opacity);
    }
    if (zIndex !== fromProps.zIndex) {
      (this.leafletElement as any).setZIndex(zIndex);
    }
  }
  public render() {
    return <div />;
  }
}

export default withLeaflet(GridLayer);
