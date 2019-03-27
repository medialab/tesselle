import React, { useState, useRef, useCallback } from 'react';
import { Rectangle } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import { SupportedShapes } from 'types';
import { SubProps } from './index';
import { LayerGroup } from './LayerGroup';

export const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [drawing, setDrawing]: [undefined | L.LatLng, (setState: undefined | L.LatLng) => any] = useState();
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
  const onMouseUp = useCallback(() => {
    if (drawing && ref.current) {
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.type = SupportedShapes.rectangle;
      props.onDrown(feature);
      setDrawing(undefined);
    }
  }, [drawing, frame]);
  return (
    <LayerGroup onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {frame && <Rectangle ref={ref} className="rectangle" color="red" bounds={frame} />}
    </LayerGroup>
  );
};
