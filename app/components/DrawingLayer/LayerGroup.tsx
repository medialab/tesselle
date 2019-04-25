import { MapLayer, withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import { LayerProps } from './index';

const eventsMap = [
  ['mousemove', 'onMouseMove'],
  ['mousedown', 'onMouseDown'],
  ['mouseup', 'onMouseUp'],
  ['click', 'onClick'],
];

export const LayerGroup = withLeaflet(class LayerGroup extends MapLayer<LayerProps> {
  public createLeafletElement(props: LayerProps): L.LayerGroup {
    const el = new L.LayerGroup([], this.getOptions(props));
    this.contextValue = {
      ...props.leaflet,
      layerContainer: el,
    };
    if (props.leaflet && props.leaflet.map) {
      for (const [htmlName, jsxName] of eventsMap) {
        if (props[jsxName]) {
          props.leaflet.map.on(htmlName, props[jsxName]);
        }
      }
    }
    return el;
  }

  public updateLeafletElement(fromProps: LayerProps, toProps: LayerProps) {
    if ((fromProps.leaflet && fromProps.leaflet.map) && (toProps.leaflet && toProps.leaflet.map)) {
      for (const [htmlName, jsxName] of eventsMap) {
        if (fromProps[jsxName] !== toProps[jsxName]) {
          fromProps.leaflet.map.off(htmlName, fromProps[jsxName]);
          toProps.leaflet.map.on(htmlName, toProps[jsxName]);
        }
      }
    }
  }
});

export default LayerGroup;
