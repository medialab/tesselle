import React, { useCallback, useRef, useEffect } from 'react';
import { Tooltip, Circle } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref.current && ref.current.leafletElement) {
      // Hack because onDblClick doesn't fire on react elemnt.
      ref.current.leafletElement.on('dblclick', toggleEdit);
    }
  }, []);
  const toggleEdit = useCallback((event) => {
    event.target.editor ? event.target.disableEdit() : event.target.enableEdit();
  }, []);
  return (
    <Circle
      ref={ref} center={coordsToLatLng(coords)} radius={annotation.properties.radius}>
      <Tooltip opacity={1} permanent>
        {annotation.properties.content}
      </Tooltip>
    </Circle>
  );
};

export default AnnotationCircle;
