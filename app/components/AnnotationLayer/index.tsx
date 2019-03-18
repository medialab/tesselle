/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup as LeafletLayerGroup, withLeaflet, MapLayerProps } from 'react-leaflet';
import React, { useCallback, memo } from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
  selectedAnnotation: Annotation;
}

const GuessComponent = ({annotation, onEdit, selected}: AnnotationShapes) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  switch (geometry.type) {
    case 'Point':
    return <AnnotationCircle selected={selected} onEdit={onEdit} annotation={annotation} />;
    case 'Polygon':
    case 'MultiPolygon':
      return <AnnotationPolygon selected={selected} onEdit={onEdit} annotation={annotation} />;
  }
  return <React.Fragment />;
};

const AnnotationLayer = (props: AnnotationLayerProps) => {
  const dispatch = useDispatch();
  const onEdit = useCallback((annotation: Annotation, newAnnotation: Annotation) => {
    dispatch(editAnnotationAction(
      annotation,
      newAnnotation,
    ));
  }, []);
  return (
    <LeafletLayerGroup>
      {props.data.map((annotation) =>
        <React.Fragment key={annotation.properties.id}>
          <GuessComponent selected={annotation === props.selectedAnnotation} onEdit={onEdit} annotation={annotation} />
        </React.Fragment>,
      )}
    </LeafletLayerGroup>
  );
};

export default withLeaflet(memo(AnnotationLayer));
