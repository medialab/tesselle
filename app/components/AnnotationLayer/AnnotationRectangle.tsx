import React, { useMemo } from 'react';
import { Rectangle, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import 'leaflet-editable';

const AnnotationRectangle: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [coords]);

  return (
    <Rectangle
      onClick={onClick}
      color={selected ? 'cyan' : 'purple'}
      draggable
      edditable
      bounds={position}
    >
      {selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Rectangle>
  );
};

export default AnnotationRectangle;
