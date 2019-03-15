/**
 *
 * DrawingLayer
 *
 */

import * as React from 'react';
import { Rectangle, MapLayer, MapLayerProps, withLeaflet, Circle } from 'react-leaflet';
import L, { LeafletMouseEvent, LeafletEventHandlerFn, LayerGroup as LeafletLayerGroup } from 'leaflet';
import { Feature, Point, Polygon, MultiPolygon } from 'geojson';

interface LayerProps extends MapLayerProps {
  onMouseMove: LeafletEventHandlerFn;
  onMouseDown: LeafletEventHandlerFn;
  onMouseUp: LeafletEventHandlerFn;
}

const eventsMap = [
  ['mousemove', 'onMouseMove'],
  ['mousedown', 'onMouseDown'],
  ['mouseup', 'onMouseUp'],
];

const LayerGroup = withLeaflet(class LayerGroup extends MapLayer<LayerProps> {
  public createLeafletElement(props: LayerProps): L.LayerGroup {
    const el = new L.LayerGroup([], this.getOptions(props));
    this.contextValue = {
      ...props.leaflet,
      layerContainer: el,
    };
    if (props.leaflet && props.leaflet.map) {
      props.leaflet.map.on('mousemove', props.onMouseMove);
      props.leaflet.map.on('mousedown', props.onMouseDown);
      props.leaflet.map.on('mouseup', props.onMouseUp);
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

interface OwnProps extends LayerProps {
  onDrown: (shape: Feature<Point | Polygon | MultiPolygon, any>) => void;
  addingShape: string | undefined;
}

interface SubProps extends OwnProps {
  map: L.Map;
}

const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [drawing, setDrawing]: [undefined | L.LatLng, (nesState: undefined | L.LatLng) => any] = React.useState();
  const [frame, setFrame] = React.useState();
  const ref = React.useRef<Rectangle>(null);

  const onMouseDown = React.useCallback((event: LeafletMouseEvent) => {
    if (addingShape) {
      setDrawing(event.latlng);
      setFrame(
        L.latLngBounds(
          event.latlng,
          event.latlng,
        ),
      );
    }
  }, [addingShape]);
  const onMouseMove = React.useCallback((event: LeafletMouseEvent) => {
    if (drawing) {
      setFrame(
        L.latLngBounds(
          drawing,
          event.latlng,
        ),
      );
    }
  }, [drawing, frame]);
  const onMouseUp = React.useCallback(() => {
    if (drawing && ref.current) {
      props.onDrown(ref.current.leafletElement.toGeoJSON());
      setDrawing(undefined);
    }
  }, [drawing, frame, ref]);
  return (
    <LayerGroup
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {frame && <Rectangle ref={ref} className="rectangle" color="red" bounds={frame} />}
    </LayerGroup>
  );
};

const DrawingCircleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [startLatLng, setStartLatLng]:
    [undefined | L.LatLng, (nesState: undefined | L.LatLng) => any] = React.useState();
  const [radius, setRadius] = React.useState();
  const ref = React.useRef<Circle>(null);

  const onMouseDown = React.useCallback((event: LeafletMouseEvent) => {
    if (addingShape) {
      setStartLatLng(event.latlng);
      setRadius(0);
    }
  }, [addingShape]);
  const onMouseMove = React.useCallback((event: LeafletMouseEvent) => {
    if (startLatLng) {
      setRadius(
        props.map.distance(event.latlng, startLatLng),
      );
    }
  }, [startLatLng, radius]);
  const onMouseUp = React.useCallback(() => {
    if (startLatLng && ref.current) {
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.radius = radius;
      props.onDrown(feature);
      setStartLatLng(undefined);
    }
  }, [startLatLng, radius, ref, props.onDrown]);
  return (
    <LayerGroup
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {startLatLng && <Circle ref={ref} radius={radius} center={startLatLng} />}
    </LayerGroup>
  );
};

// tslint:disable-next-line: max-classes-per-file
class DrawingLayer extends MapLayer<any> {

  public createLeafletElement(props) {
    const el = new LeafletLayerGroup([], this.getOptions(props));
    this.contextValue = { ...props.leaflet, layerContainer: el };
    return el;
  }

  public updateLeafletElement(): any {

  }
  public render() {
    const props = this.props;
    if (props.leaflet && props.leaflet.map)  {
      if (props.addingShape === 'rectangle') {
        return <DrawingRectangleLayer map={props.leaflet.map} {...props as OwnProps} />;
      } else if (props.addingShape === 'circle') {
        return <DrawingCircleLayer map={props.leaflet.map} {...props as OwnProps} />;
      } else {
        return <React.Fragment />;
      }
    } else {
      return <React.Fragment />;
    }
  }
}

export default withLeaflet(DrawingLayer);
