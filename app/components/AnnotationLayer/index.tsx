/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup as LeafletLayerGroup, withLeaflet, MapLayerProps } from 'react-leaflet';
import React, { useCallback, memo } from 'react';

import Annotation from 'types/Annotation';
import { List, Set } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';
import L from 'leaflet';
import { SupportedShapes } from 'types';
import AnnotationRectangle from './AnnotationRectangle';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
  selectedAnnotation: Set<Annotation>;
  leaflet;
  onLayerClick?: (annotation: Annotation) => any;
}

const GuessComponent = ({annotation, onEdit, selected, map, onClick}: AnnotationShapes) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const onLayerClick = useCallback((event) => {
    console.log('on layer click');
    L.DomEvent.stopPropagation(event);
    return onClick && onClick(annotation);
  }, [onClick, annotation]);
  switch (geometry.type) {
    case 'Point':
    return (
      <AnnotationCircle
        onClick={onLayerClick}
        map={map}
        selected={selected}
        onEdit={onEdit}
        annotation={annotation} />
    );
    case 'Polygon':
    case 'MultiPolygon':
      if (annotation.properties.type === SupportedShapes.rectangle) {
        return (
          <AnnotationRectangle
            onClick={onLayerClick}
            map={map}
            selected={selected}
            onEdit={onEdit}
            annotation={annotation} />
        );
      }
      return (
        <AnnotationPolygon
          onClick={onLayerClick}
          map={map}
          selected={selected}
          onEdit={onEdit}
          annotation={annotation} />
      );
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
          <GuessComponent
            onClick={props.onLayerClick}
            onEdit={onEdit}
            map={props.leaflet.map}
            annotation={annotation}
            selected={props.selectedAnnotation.contains(annotation)} />
        </React.Fragment>,
      )}
    </LeafletLayerGroup>
  );
};

export default withLeaflet(memo(AnnotationLayer));
