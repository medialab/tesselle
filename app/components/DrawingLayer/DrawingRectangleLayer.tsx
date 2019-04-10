import React, { useState, useRef, useCallback } from 'react';
import { Rectangle } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import { SupportedShapes } from 'types';
import { SubProps } from './index';
import { LayerGroup } from './LayerGroup';

export const DrawingRectangleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const [startPoint, setStartPoint] = useState<L.LatLng>();
  const [frame, setFrame] = useState<L.LatLngBounds>();
  const ref = useRef<Rectangle>(null);

  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
    setStartPoint(event.latlng);
  }, []);
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (startPoint) {
      setFrame(L.latLngBounds(startPoint, event.latlng));
    }
  }, [startPoint, frame]);
  const onMouseUp = useCallback((event) => {
    setStartPoint(undefined);
    if (startPoint && frame && ref.current) {
      const feature = ref.current.leafletElement.toGeoJSON();
      feature.properties.type = SupportedShapes.rectangle;
      props.onDrown(feature);
      setFrame(undefined);
    }
  }, [startPoint, frame]);

  return (
    <LayerGroup onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {frame && <Rectangle ref={ref} className="rectangle" color="white" weight={1} bounds={frame} />}
    </LayerGroup>
  );
};
