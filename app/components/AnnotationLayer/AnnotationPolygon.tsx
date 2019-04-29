import React, { useRef, useEffect, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import { SupportedShapes } from 'types';

const AnnotationPolygon: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected, onClick, tool} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [selected]);

  useEffect((): any => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      if (selected && tool === SupportedShapes.selector) {
        try {
          ref.current.leafletElement.enableEdit();
          ref.current.leafletElement.dragging.enable();
        } catch (e) {
          console.log('only on reload');
        }
      } else {
        try {
          ref.current.leafletElement.disableEdit();
          ref.current.leafletElement.dragging.disable();
        } catch (e) {
          console.log('only on reload');
        }
      }
    }
  }, [selected, tool]);

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
