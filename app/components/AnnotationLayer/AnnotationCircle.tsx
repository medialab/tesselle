import React, { useMemo, useRef } from 'react';
import { Circle, Tooltip, CircleProps } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes, AddedProperties } from './types';
import { useEdit } from 'utils/hooks';
import Annotation, { AnnotationCircleProperties } from 'types/Annotation';
import { Point } from 'geojson';

const AnnotationCircle: React.SFC<AnnotationShapes & {
  annotation: Annotation<Point, AnnotationCircleProperties>,
}> = (props) => {
  const {annotation, selected} = props;
  const center = useMemo(() => coordsToLatLng(annotation.geometry.coordinates), [annotation.geometry.coordinates]);
  const ref = useRef<Circle<AddedProperties & CircleProps>>(null);
  useEdit(ref, props.editable && selected);
  const showPopup = props.editable && !selected;
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
      {(showPopup) && (
        <Tooltip opacity={1} permanent interactive>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
