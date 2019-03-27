import React, { useState, useRef, useCallback } from 'react';
import { Circle } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import { SubProps } from './index';
import { LayerGroup } from './LayerGroup';

export const DrawingCircleLayer: React.SFC<SubProps> = (props: SubProps) => {
  const { addingShape } = props;
  const [startLatLng, setStartLatLng]: [undefined | L.LatLng, (setState: undefined | L.LatLng) => any] = useState();
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
      setRadius(props.map.distance(event.latlng, startLatLng));
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
    <LayerGroup onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {startLatLng && <Circle ref={ref} radius={radius} center={startLatLng} />}
    </LayerGroup>
  );
};
