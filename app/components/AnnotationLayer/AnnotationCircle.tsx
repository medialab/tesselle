import React, { useCallback, useMemo, useState } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng, fromJS } from 'utils/geo';
import { AnnotationShapes } from './types';

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation, onEdit}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [coords]);
  const [editing, setEditing] = useState<boolean>(false);
  const toggleEdit = useCallback((event) => {
    if (editing) {
      event.target.disableEdit();
      onEdit(
        annotation,
        fromJS(event.target.toGeoJSON()).set(
          'properties',
          annotation.properties.set(
            'radius',
            event.target._mRadius,
          ),
        ),
      );
      setEditing(false);
    } else {
      event.target.enableEdit();
      setEditing(true);
    }
  }, [editing]);
  return (
    <Circle onDblClick={toggleEdit} center={center} radius={annotation.properties.radius}>
      {!editing && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
