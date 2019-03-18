import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs, fromJS } from 'utils/geo';
import { AnnotationShapes } from './types';
import { LeafletMouseEvent } from 'leaflet';

const CustomTypePolygon: any = Polygon;

const AnnotationPolygon: React.SFC<AnnotationShapes> = ({annotation, onEdit, selected}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [coords, geometry.type]);
  useEffect((): any => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      // Edition is on by default.
      ref.current.leafletElement.dragging.disable();
    }
  }, []);
  const toggleEdit = useCallback((event: LeafletMouseEvent) => {
    if (editing) {
      event.target.disableEdit();
      event.target.dragging.disable();
      setEditing(false);
      onEdit(
        annotation,
        fromJS(event.target.toGeoJSON()).set(
          'properties',
          annotation.properties,
        ),
      );
    } else {
      event.target.enableEdit();
      event.target.dragging.enable();
      setEditing(true);
    }
  }, [editing]);
  return (
    <CustomTypePolygon
      color={selected ? 'cyan' : 'lightblue'}
      ref={ref}
      draggable
      onClick={toggleEdit}
      positions={position}
    >
      {!editing && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </CustomTypePolygon>
  );
};

export default AnnotationPolygon;
