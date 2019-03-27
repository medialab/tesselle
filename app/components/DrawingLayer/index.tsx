/**
 *
 * DrawingLayer
 *
 */

import React from 'react';
import { MapLayer, MapLayerProps, withLeaflet } from 'react-leaflet';
import L, { LeafletEventHandlerFn, LayerGroup as LeafletLayerGroup } from 'leaflet';
import geojson from 'geojson';
import { SupportedShapes } from 'types';
import { DrawingRectangleLayer } from './DrawingRectangleLayer';
import { DrawingCircleLayer } from './DrawingCircleLayer';
import { DrawingPolygonLayer } from './DrawingPolygonLayer';

export interface LayerProps extends MapLayerProps {
  onMouseMove?: LeafletEventHandlerFn;
  onMouseDown?: LeafletEventHandlerFn;
  onMouseUp?: LeafletEventHandlerFn;
}

export const eventsMap = [
  ['mousemove', 'onMouseMove'],
  ['mousedown', 'onMouseDown'],
  ['mouseup', 'onMouseUp'],
];

interface OwnProps extends LayerProps {
  onDrown: (shape: geojson.Feature<geojson.Point | geojson.Polygon | geojson.MultiPolygon, any>) => void;
  addingShape: string | undefined;
}

export interface SubProps extends OwnProps {
  map: L.Map;
}

// tslint:disable-next-line: max-classes-per-file
class DrawingLayer extends MapLayer<any> {
  public createLeafletElement(props) {
    const el = new LeafletLayerGroup([], this.getOptions(props));
    this.contextValue = { ...props.leaflet, layerContainer: el };
    return el;
  }

  public render() {
    const props = this.props;
    if (props.leaflet && props.leaflet.map)  {
      switch (props.addingShape) {
        case SupportedShapes.rectangle:
          return <DrawingRectangleLayer map={props.leaflet.map} {...props as OwnProps} />;
        case SupportedShapes.circle:
          return <DrawingCircleLayer map={props.leaflet.map} {...props as OwnProps} />;
        case SupportedShapes.polygon:
          return <DrawingPolygonLayer key={Math.random()} map={props.leaflet.map} {...props as any} />;
        case SupportedShapes.selector:
          return <DrawingRectangleLayer map={props.leaflet.map} {...props as OwnProps} />;
        default:
          return <React.Fragment />;
      }
    } else {
      return <React.Fragment />;
    }
  }
}

export default withLeaflet(DrawingLayer);
