import React, { useState, useRef, useCallback } from 'react';
import { Rectangle } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import { SupportedShapes } from 'types';
import { SubProps } from './index';
import { LayerGroup } from './LayerGroup';

export const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const [drawing, setDrawing] = useState();
  const [frame, setFrame] = useState();
  const ref = useRef<Rectangle>(null);

  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
    setDrawing(event.latlng);
  }, []);
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (drawing) {
      setFrame(L.latLngBounds(drawing, event.latlng));
    }
  }, [drawing, frame]);
  const onMouseUp = useCallback((event) => {
    setDrawing(null);
    if (drawing && frame && ref.current) {
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.type = SupportedShapes.rectangle;
      props.onDrown(feature);
      setFrame(null);
    }
  }, [drawing, frame]);

  return (
    <LayerGroup onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {frame && <Rectangle ref={ref} className="rectangle" color="white" weight={1} bounds={frame} />}
    </LayerGroup>
  );
};
