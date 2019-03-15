import React, { useEffect, useCallback, useRef } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';

const CustomTypePolygon: any = Polygon;

const AnnotationPolygon: React.SFC<AnnotationShapes> = ({annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      ref.current.leafletElement.on('dblclick', toggleEdit);
      ref.current.leafletElement.dragging.disable();
    }
  }, []);
  const toggleEdit = useCallback((event) => {
    event.target.editor ? event.target.disableEdit() : event.target.enableEdit();
    (event.target.dragging && event.target.dragging._enabled)
      ? event.target.dragging.enable()
      : event.target.dragging.disable();
  }, []);
  return (
    <CustomTypePolygon draggable dblClick={toggleEdit} ref={ref} positions={coordsToLatLngs(
      coords,
      geometry.type === 'Polygon' ? 1 : 2,
    ).toJS()}>
      <Tooltip opacity={1} permanent>
        {annotation.properties.content}
      </Tooltip>
    </CustomTypePolygon>
  );
};

export default AnnotationPolygon;
