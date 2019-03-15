import React, { useCallback } from 'react';
import { Tooltip, Circle } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const toggleEdit = useCallback((event) => {
    event.target.editor ? event.target.disableEdit() : event.target.enableEdit();
  }, []);
  return (
    <Circle
      onClick={toggleEdit} center={coordsToLatLng(coords)} radius={annotation.properties.radius}>
      <Tooltip opacity={1} permanent>
        {annotation.properties.content}
      </Tooltip>
    </Circle>
  );
};

export default AnnotationCircle;
