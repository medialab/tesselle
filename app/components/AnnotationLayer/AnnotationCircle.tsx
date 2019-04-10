import React, { useMemo, useRef, useEffect } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { coordsToLatLng, fromJS } from 'utils/geo';
import { AnnotationShapes } from './types';
import { SupportedShapes } from 'types';
import { noop } from 'ramda';

const okEvents = ['editable:drag', 'editable:vertex:dragend'].join(' ');

const AnnotationCircle: React.SFC<AnnotationShapes> = ({annotation, selected, onEdit, onClick, tool}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const center = useMemo(() => coordsToLatLng(coords), [selected]);
  // Because leaflet editor plugin is an ugly monkey patch and does not provide good typing.
  // This is why we us a any caster.
  const ref = useRef<Circle & any>(null);
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
    return noop;
  });

  useEffect(() => {
    if (ref.current && ref.current.leafletElement) {
      try {
        if (selected && tool === SupportedShapes.selector) {
          ref.current.leafletElement.enableEdit();
        } else {
          ref.current.leafletElement.disableEdit();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selected, tool]);
  return (
    <Circle
      ref={ref}
      onClick={onClick}
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
