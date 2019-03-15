/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup, Polygon, Tooltip } from 'react-leaflet';
import React, { useCallback, useEffect, useRef } from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import { coordsToLatLngs } from 'utils/geo';

interface AnnotationLayerProps {
  data: List<Annotation>;
}

const CustomTypePolygon: any = Polygon;

const GuessComponent = ({annotation}: {annotation: Annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const ref = useRef<Polygon>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current.leafletElement as any).dragging.disable();
    }
  }, []);
  const toggleEdit = useCallback((event) => {
    event.target.editor ? event.target.disableEdit() : event.target.enableEdit();
    event.target.dragging._enabled ? event.target.dragging.enable() : event.target.dragging.disable();
  }, []);

  switch (geometry.type) {
    case 'Polygon':
    case 'MultiPolygon':
      return (
        <CustomTypePolygon draggable ref={ref} onclick={toggleEdit} positions={coordsToLatLngs(
          coords,
          geometry.type === 'Polygon' ? 1 : 2,
        ).toJS()}>
          <Tooltip opacity={1} permanent>
            {annotation.properties.content}
          </Tooltip>
        </CustomTypePolygon>
      );
  }
  return <React.Fragment />;
};

const AnnotationLayer = (props: AnnotationLayerProps) => {
  return (
    <LayerGroup>
      {props.data.map((annotation) =>
        <React.Fragment key={annotation.properties.id}>
          <GuessComponent annotation={annotation} />
        </React.Fragment>,
      )}
    </LayerGroup>
  );
};

export default AnnotationLayer;
