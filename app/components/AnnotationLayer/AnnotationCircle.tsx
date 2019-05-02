import React, { useMemo, useRef } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';
import { useEdit } from 'utils/hooks';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation, selected, onClick}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [selected]);
  const color = selected ? 'cyan' : '#aaa';
  const ref = useRef<Circle & any>(null);
  useEdit(ref, selected);
  return (
    <Circle
      className={`annotation-shape ${selected && 'annotation-shape__editing'}`}
      ref={ref}
      onClick={onClick}
      color={color}
      weight={1.5}
      lineCap="butt"
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
