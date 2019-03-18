import React, { useCallback, useState } from 'react';
import { Tooltip, Circle } from 'react-leaflet';
import { coordsToLatLng } from 'utils/geo';
import { AnnotationShapes } from './types';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const [editing, setEditing] = useState<boolean>(false);
  const toggleEdit = useCallback((event) => {
    if (editing) {
      event.target.disableEdit();
      setEditing(false);
    } else {
      event.target.enableEdit();
      setEditing(true);
    }
  }, [editing]);
  return (
    <Circle onDblClick={toggleEdit} center={coordsToLatLng(coords)} radius={annotation.properties.radius}>
      {!editing && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
