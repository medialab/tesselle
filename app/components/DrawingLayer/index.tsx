/**
 *
 * DrawingLayer
 *
 */

import React, { useState, useRef, useCallback } from 'react';
import { Rectangle, MapLayer, MapLayerProps, withLeaflet, Circle, PolygonProps, Path } from 'react-leaflet';
import L, { LeafletMouseEvent, LeafletEventHandlerFn, LayerGroup as LeafletLayerGroup } from 'leaflet';
import geojson from 'geojson';
import { SupportedShapes } from 'types';

interface LayerProps extends MapLayerProps {
  onMouseMove?: LeafletEventHandlerFn;
  onMouseDown?: LeafletEventHandlerFn;
  onMouseUp?: LeafletEventHandlerFn;
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

interface OwnProps extends LayerProps {
  onDrown: (shape: geojson.Feature<geojson.Point | geojson.Polygon | geojson.MultiPolygon, any>) => void;
  addingShape: string | undefined;
}

interface SubProps extends OwnProps {
  map: L.Map;
}

// tslint:disable-next-line: max-classes-per-file
const DrawingPolygonLayer = withLeaflet(class DrawingPolygonLayer extends Path<PolygonProps, L.Path> {
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

const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [drawing, setDrawing]: [undefined | L.LatLng, (setState: undefined | L.LatLng) => any] = useState();
  const [frame, setFrame] = useState();
  const ref = useRef<Rectangle>(null);

  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
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
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (drawing) {
      setFrame(
        L.latLngBounds(
          drawing,
          event.latlng,
        ),
      );
    }
  }, [drawing, frame]);
  const onMouseUp = useCallback(() => {
    if (drawing && ref.current) {
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.type = SupportedShapes.rectangle;
      props.onDrown(feature);
      setDrawing(undefined);
    }
  }, [drawing, frame]);
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
  const [startLatLng, setStartLatLng]: [
    undefined | L.LatLng,
    (setState: undefined | L.LatLng) => any
  ] = useState();
  const [radius, setRadius] = useState();
  const ref = useRef<Circle>(null);

  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
    if (addingShape) {
      setStartLatLng(event.latlng);
      setRadius(0);
    }
  }, [addingShape]);
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (startLatLng) {
      setRadius(
        props.map.distance(event.latlng, startLatLng),
      );
    }
  }, [startLatLng, radius]);
  const onMouseUp = useCallback(() => {
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

  public render() {
    const props = this.props;
    if (props.leaflet && props.leaflet.map)  {
      if (props.addingShape === SupportedShapes.rectangle) {
        return <DrawingRectangleLayer map={props.leaflet.map} {...props as OwnProps} />;
      } else if (props.addingShape === SupportedShapes.circle) {
        return <DrawingCircleLayer map={props.leaflet.map} {...props as OwnProps} />;
      } else if (props.addingShape === SupportedShapes.polygon) {
        // Random is not a good solution. But it does works well 🤷.
        return <DrawingPolygonLayer key={Math.random()} map={props.leaflet.map} {...props as any} />;
      } else {
        return <React.Fragment />;
      }
    } else {
      return <React.Fragment />;
    }
  }
}

export default withLeaflet(DrawingLayer);
