import React, { useMemo, useRef, useEffect } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng, fromJS } from 'utils/geo';
import { AnnotationShapes } from './types';

const okEvents = ['editable:drag', 'editable:vertex:dragend'].join(' ');

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation, selected, onEdit}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [selected]);
  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref.current && ref.current.leafletElement) {
      const save = () => {
        onEdit(
          annotation,
          fromJS(ref.current.leafletElement.toGeoJSON()).set(
            'properties',
            annotation.properties.set(
              'radius',
              ref.current.leafletElement._mRadius,
            ),
          ),
        );
      };
      ref.current.leafletElement.on(okEvents, save);
      return () => {
        ref.current.leafletElement.off(okEvents, save);
      };
    }
    return () => {

    };
  });

  useEffect(() => {
    if (ref.current && ref.current.leafletElement) {
      try {
        if (!selected) {
          ref.current.leafletElement.disableEdit();
        } else {
          ref.current.leafletElement.enableEdit();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selected]);
  return (
    <Circle
      ref={ref}
      color={selected ? 'cyan' : 'purple'}
      center={center}
      radius={annotation.properties.radius}
    >
      {!selected && (
        <Tooltip opacity={1} permanent>
          {annotation.properties.content}
        </Tooltip>
      )}
    </Circle>
  );
};

export default AnnotationCircle;
