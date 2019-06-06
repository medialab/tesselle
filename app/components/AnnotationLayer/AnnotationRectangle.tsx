import React, { useMemo, useRef } from 'react';
import { Rectangle, Tooltip, RectangleProps } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes, AddedProperties } from './types';
import 'leaflet-editable';
import { useEdit } from 'utils/hooks';

const AnnotationRectangle: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected} = props;
  const position = useMemo(() => coordsToLatLngs(
    annotation.geometry.coordinates,
    1,
  ).toJS(), [annotation.geometry.coordinates]);
  const ref = useRef<Rectangle<AddedProperties & RectangleProps>>(null);
  useEdit(ref, props.editable && selected);
  return (
    <Rectangle
      key={props.className}
      ref={ref}
      {...props}
      bounds={position}
      editing
      original
      properties={annotation.properties}
    >
      {(!selected || !props.editable) && (
        <Tooltip opacity={1} permanent interactive>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Rectangle>
  );
};

export default AnnotationRectangle;
