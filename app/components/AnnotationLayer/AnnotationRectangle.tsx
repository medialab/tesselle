import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Rectangle, Tooltip, Marker } from 'react-leaflet';

import { coordsToLatLngs } from 'utils/geo';
import { AnnotationShapes } from './types';
import { tail } from 'ramda';
import 'leaflet-editable';
import { LatLng, divIcon, DomEvent } from 'leaflet';

const CustomTypeRectangle: any = Rectangle;

// const Carre = props => <div className="coucou" />;
const icon = divIcon({
  className: 'leaflet-div-icon leaflet-vertex-icon',
});

const AnnotationRectangle: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, selected, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<any>(null);
  const position = useMemo(() => coordsToLatLngs(
    coords,
    geometry.type === 'Polygon' ? 1 : 2,
  ).toJS(), [selected]);
  const [initialShape, setInitialShape] = useState(tail(position[0]));
  const onMarkerDrag = useCallback((event) => {
    // console.log(, index);
    const newArray = [...initialShape];
    newArray[2] = event.target.getLatLng();
    console.log(newArray);
    // setInitialShape
    setInitialShape(newArray);
  }, []);

  return (
    <CustomTypeRectangle
      onClick={onClick}
      color={selected ? 'cyan' : 'purple'}
      ref={ref}
      draggable
      edditable
      bounds={position}
    >
      {!selected ? (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      ) : (
        initialShape.map((latLng: LatLng, index) => {
          return (
            <Marker
              draggable
              onDrag={onMarkerDrag}
              onMouseDown={DomEvent.stopPropagation}
              icon={icon}
              position={latLng}
              key={`${latLng.lat}-${latLng.lng}`} />
          );
        })
      )}
    </CustomTypeRectangle>
  );
};

export default AnnotationRectangle;
