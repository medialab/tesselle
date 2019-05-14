import React, { useMemo, useRef } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';
import { useEdit } from 'utils/hooks';

const AnnotationCircle: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [selected]);
  const ref = useRef<Circle & any>(null);
  useEdit(ref, selected);
  return (
    <Circle
      key={props.className}
      ref={ref}
      {...props}
      center={center}
      radius={annotation.properties.radius}
      editing
      original
      properties={annotation.properties}
    >
      {!selected && (
        <Tooltip opacity={1} permanent interactive>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
