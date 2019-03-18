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
import { LayerGroup } from 'leaflet';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
}

const GuessComponent = ({annotation, onEdit}: AnnotationShapes) => {
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  switch (geometry.type) {
    case 'Point':
    return <AnnotationCircle onEdit={onEdit} annotation={annotation} />;
    case 'Polygon':
    case 'MultiPolygon':
      return <AnnotationPolygon onEdit={onEdit} annotation={annotation} />;
  }
  return <React.Fragment />;
};

const AnnotationLayer = (props: AnnotationLayerProps) => {
  const dispatch = useDispatch();
  const onEdit = useCallback((annotation: Annotation, layer: LayerGroup) => {
    const features = layer.toGeoJSON() as any;
    features.properties = annotation.properties.toJS();
    dispatch(editAnnotationAction(
      annotation,
      features,
    ));
  }, []);
  return (
    <LeafletLayerGroup>
      {props.data.map((annotation) =>
        <React.Fragment key={annotation.properties.id}>
          <GuessComponent onEdit={onEdit} annotation={annotation} />
        </React.Fragment>,
      )}
    </LeafletLayerGroup>
  );
};

export default withLeaflet(memo(AnnotationLayer));
