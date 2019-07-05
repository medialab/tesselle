import React, { useRef, useMemo } from 'react';
import { Polygon, Tooltip, PolygonProps } from 'react-leaflet';

import { coordsToLatLngs, circleToPolygon } from 'utils/geo';
import { AnnotationShapes, AddedProperties } from './types';
import { useEdit } from 'utils/hooks';

const AnnotationHighlight: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected} = props;
  const ref = useRef<Polygon<AddedProperties & PolygonProps>>(null);
  const position = useMemo(() =>
    annotation.geometry.type === 'Point' ?
      circleToPolygon(
        annotation.geometry.coordinates,
        annotation.properties.radius,
        50,
      )
      :
      coordsToLatLngs(
        annotation.geometry.coordinates,
        annotation.geometry.type === 'Polygon' ? 1 : 2,
      ).toJS()
  , [selected]);

  useEdit(ref, props.editable && selected);

  const outerShape = [
        {
            lat: -500,
            lng: 500,
        },
        {
            lat: 500,
            lng: 500,
        },
        {
            lat: 500,
            lng: -500,
        },
        {
            lat: -500,
            lng: -500,
        },
    ];
  return (
    <Polygon
      key={props.className}
      ref={ref}
      {...props}
      positions={[outerShape, position]}
      editing
      original
      properties={annotation.properties}
    >
      {(!selected || !props.editable) && (
        <Tooltip opacity={1} permanent interactive>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Polygon>
  );
};

export default AnnotationHighlight;
