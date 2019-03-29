import React, { useState, useRef, useCallback } from 'react';
import { Rectangle } from 'react-leaflet';
import L, { LeafletMouseEvent, DomEvent } from 'leaflet';
import { SupportedShapes } from 'types';
import { SubProps } from './index';
import { LayerGroup } from './LayerGroup';

export const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [drawing, setDrawing] = useState();
  const [frame, setFrame] = useState();
  const ref = useRef<Rectangle>(null);
  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
    if (addingShape) {
      setDrawing(event.latlng);
      setFrame(L.latLngBounds(event.latlng, event.latlng));
    }
  }, [addingShape]);
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (drawing) {
      setFrame(L.latLngBounds(drawing, event.latlng));
    }
  }, [drawing, frame]);
  const onMouseUp = useCallback((event) => {
    if (drawing && ref.current) {
      DomEvent.preventDefault(event.originalEvent);
      DomEvent.stopPropagation(event.originalEvent);
      DomEvent.stop(event.originalEvent);
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.type = SupportedShapes.rectangle;
      props.onDrown(feature);
      setDrawing(null);
      setFrame(null);
    }
  }, [drawing, frame]);
  return (
    <LayerGroup onMouseMove={onMouseMove} onMouseDown={onMouseDown} onClick={onMouseUp}>
      {frame && <Rectangle ref={ref} className="rectangle" color="red" bounds={frame} />}
    </LayerGroup>
  );
};
