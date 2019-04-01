/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup as LeafletLayerGroup, withLeaflet, MapLayerProps } from 'react-leaflet';
import React, { useCallback, memo } from 'react';
import { SupportedShapes } from 'types';
import { DomEvent } from 'leaflet';

import Annotation from 'types/Annotation';
import { List, Set } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';
import AnnotationRectangle from './AnnotationRectangle';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
  selectedAnnotations: Set<Annotation>;
  leaflet;
  onLayerClick?: (annotation: Annotation) => any;
  tool: SupportedShapes;
}

const GuessComponent = ({annotation, onEdit, selected, map, onClick, tool}: AnnotationShapes) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const onLayerClick = useCallback((event) => {
    DomEvent.stopPropagation(event);
    return onClick && onClick(annotation);
  }, [onClick, annotation]);
  switch (geometry.type) {
    case 'Point':
    return (
      <AnnotationCircle
        onClick={onLayerClick}
        tool={tool}
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
            tool={tool}
            map={map}
            selected={selected}
            onEdit={onEdit}
            annotation={annotation} />
        );
      }
      return (
        <AnnotationPolygon
          onClick={onLayerClick}
          tool={tool}
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
            tool={props.tool}
            onClick={props.onLayerClick}
            onEdit={onEdit}
            map={props.leaflet.map}
            annotation={annotation}
            selected={props.selectedAnnotations.contains(annotation)} />
        </React.Fragment>,
      )}
    </LeafletLayerGroup>
  );
};

export default withLeaflet(memo(AnnotationLayer));
