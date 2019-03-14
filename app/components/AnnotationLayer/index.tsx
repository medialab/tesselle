/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup, Polygon, Tooltip } from 'react-leaflet';
import React, { useCallback } from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import { coordsToLatLngs } from 'utils/geo';

interface AnnotationLayerProps {
  data: List<Annotation>;
}

const GuessComponent = ({annotation}: {annotation: Annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const coords = geometry ? geometry.coordinates : null;
  const toggleEdit = useCallback((event) => {
    event.target.enableEdit();
  }, []);
  switch (geometry.type) {
    case 'Polygon':
    case 'MultiPolygon':
      return (
        <Polygon onclick={toggleEdit} positions={coordsToLatLngs(
          coords,
          geometry.type === 'Polygon' ? 1 : 2,
        ).toJS()}>
          <Tooltip opacity={1} permanent>
            {annotation.properties.content}
          </Tooltip>
        </Polygon>
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
