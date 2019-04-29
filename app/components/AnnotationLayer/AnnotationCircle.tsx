import React, { useMemo, useEffect, useRef } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation, selected}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [selected]);
  const color = selected ? 'cyan' : 'purple';
  const ref = useRef<Circle & any>(null);
  // Because leaflet editor plugin is an ugly monkey patch and does not provide good typing.
  // This is why we us a any caster.
  useEffect(() => {
    if (ref.current) {
      if (selected) {
        ref.current.leafletElement.editing.enable();
      } else {
        ref.current.leafletElement.editing.disable();
      }
    }
  });
  return (
    <Circle
      ref={ref}
      color={color}
      center={center}
      radius={annotation.properties.radius}
    >
      {!selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
