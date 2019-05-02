import React, { useMemo, useRef } from 'react';
import { Rectangle, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import 'leaflet-editable';
import { useEdit } from 'utils/hooks';

const AnnotationRectangle: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [coords]);
  const ref = useRef<Rectangle & any>(null);
  useEdit(ref, selected);

  return (
    <Rectangle
      className={`annotation-shape ${selected && 'annotation-shape__editing'}`}
      ref={ref}
      onClick={onClick}
      color={selected ? 'cyan' : '#aaa'}
      draggable
      edditable
      bounds={position}
      weight={1.5}
      lineCap="butt"
    >
      {!selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Rectangle>
  );
};

export default AnnotationRectangle;
