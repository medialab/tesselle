/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup } from 'react-leaflet';
import React from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import { geometryToLayer } from './LeafletElement';

interface AnnotationLayerProps {
  data: List<Annotation>;
}

const AnnotationLayer = (props: AnnotationLayerProps) => {
  return (
    <LayerGroup>
      {props.data.map((annotation) =>
        <React.Fragment key={annotation.properties.id}>{geometryToLayer(annotation, {})}</React.Fragment>,
      )}
    </LayerGroup>
  );
};

export default AnnotationLayer;
