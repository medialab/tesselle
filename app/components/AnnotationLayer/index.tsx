/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup } from 'react-leaflet';
import React from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';

interface AnnotationLayerProps {
  data: List<Annotation>;
}

const GuessComponent = ({annotation}: {annotation: Annotation}) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;

  switch (geometry.type) {
    case 'Point':
    return <AnnotationCircle annotation={annotation} />;
    case 'Polygon':
    case 'MultiPolygon':
      return <AnnotationPolygon annotation={annotation} />;
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
