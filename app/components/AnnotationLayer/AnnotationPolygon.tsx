import React, { useRef, useEffect, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import 'leaflet-editable';

const CustomTypePolygon: any = Polygon;

const AnnotationPolygon: React.SFC<AnnotationShapes> = ({annotation, onEdit, selected, map}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [coords, geometry.type]);

  useEffect((): any => {
    if (ref.current && ref.current.leafletElement && ref.current.leafletElement.dragging) {
      if (!selected) {
        try {

          ref.current.leafletElement.disableEdit();
          ref.current.leafletElement.dragging.disable();
        } catch (e) {
          console.log('only on reload');
        }
        // onEdit(
        //   annotation,
        //   fromJS(ref.current.leafletElemen.toGeoJSON()).set(
        //     'properties',
        //     annotation.properties,
        //   ),
        // );
      } else {
        ref.current.leafletElement.enableEdit();
        ref.current.leafletElement.dragging.enable();
      }
    }
  }, [selected, ref]);

  return (
    <CustomTypePolygon
      onMouseDown={console.log}
      color={selected ? 'cyan' : 'purple'}
      ref={ref}
      draggable
      edditable
      positions={position}
    >
      <Tooltip opacity={1} permanent>
        {annotation.properties.content}
      </Tooltip>
    </CustomTypePolygon>
  );
};

export default AnnotationPolygon;
