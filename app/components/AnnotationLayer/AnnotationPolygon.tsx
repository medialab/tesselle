import React, { useRef, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import { useEdit } from 'utils/hooks';

const AnnotationPolygon: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [selected]);

  useEdit(ref, selected);

  return (
    <Polygon
      onClick={onClick}
      color={selected ? 'cyan' : 'purple'}
      ref={ref}
      draggable
      edditable
      positions={position}
    >
      {!selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Polygon>
  );
};

export default AnnotationPolygon;
