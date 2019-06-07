/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup as LeafletLayerGroup, withLeaflet, FeatureGroup } from 'react-leaflet';
import React, { useCallback, useRef } from 'react';
import { SupportedShapes, Annotations, SureContextProps } from 'types';
import { DomEvent } from 'leaflet';
import EditControl from './EditControl';
import { useDispatch } from 'react-redux';
import './styles.css';

import Annotation from 'types/Annotation';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { editAnnotationAction } from 'containers/Editor/actions';
import AnnotationRectangle from './AnnotationRectangle';
import { fromJS } from 'utils/geo';

interface AnnotationLayerProps {
  data: Annotations;
  selectedAnnotations: Annotations;
  leaflet;
  onLayerClick?: (annotation: Annotation) => any;
  onCreated?: any;
  editable?: boolean;
}

const GuessComponent: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, onClick} = props;
  const onLayerClick = useCallback((event) => {
    DomEvent.stopPropagation(event);
    return onClick && onClick(annotation);
  }, [onClick, annotation]);
  switch (annotation.geometry.type) {
    case 'Point':
      return <AnnotationCircle {...props} onClick={onLayerClick} />;
    case 'Polygon':
    case 'MultiPolygon':
      if (annotation.properties.type === SupportedShapes.rectangle) {
        return <AnnotationRectangle {...props} onClick={onLayerClick} />;
      }
      return <AnnotationPolygon {...props} onClick={onLayerClick} />;
  }
  return <React.Fragment />;
};

const AnnotationLayer = withLeaflet<AnnotationLayerProps & SureContextProps>((props) => {
  const map = props.leaflet.map;
  const dispatch = useDispatch();
  const containerRef = useRef<FeatureGroup>(null);
  const onEdit = useCallback(() => {
    if (props.selectedAnnotations && containerRef.current && props.onCreated) {
      containerRef.current.leafletElement.getLayers().forEach((layer: any) => {
        const annotation = props.selectedAnnotations.find(
          (annotation) => annotation.properties.id === layer.options.properties.id,
        );
        if (annotation) {
          const feature = layer.toGeoJSON();
          if (annotation.properties.type === SupportedShapes.circle) {
            dispatch(editAnnotationAction(
              annotation,
              annotation.set(
                'geometry',
                fromJS(feature.geometry),
              ).setIn(
                ['properties', 'radius'],
                (layer as L.CircleMarker).getRadius(),
              ),
            ));
          }
          return dispatch(editAnnotationAction(
            annotation,
            fromJS(feature).set('properties', annotation.properties),
          ));
        }
        return;
      });
      return;
    }
  }, [props.selectedAnnotations, props.onCreated, containerRef.current]);
  const onCreate = useCallback((event) => {
    if (event.layerType === SupportedShapes.circle) {
      const feature = event.layer.toGeoJSON();
      feature.properties.radius = (event.layer as L.CircleMarker).getRadius();
      event.layer.remove(map);
      return props.onCreated(feature);
    }
    const feature = event.layer.toGeoJSON();
    feature.properties.type = event.layerType;
    event.layer.remove(map);
    return props.onCreated(feature);
  }, []);

  return (
    <LeafletLayerGroup>
      <FeatureGroup ref={containerRef}>
        {props.editable &&
          <EditControl
            position="topright"
            onEdited={onEdit}
            onCreated={onCreate}
            onEditMove={onEdit}
            onEditResize={onEdit}
            onEditVertex={onEdit}
            edit={{
              edit: false,
              remove: false,
            }}
            draw={{
              circlemarker: false,
              marker: false,
              polyline: false,
              circle: false,
              rectangle: false,
              polygon: false,
            }}
          />}
        {props.data.map((annotation) => {
          const selected = props.selectedAnnotations.contains(annotation);
          return (
            <GuessComponent
              className={`annotation-shape ${selected && 'annotation-shape__editing'}`}
              key={annotation.properties.id}
              color={selected ? 'black' : 'white'}
              weight={1.5}
              editable={props.editable}
              lineCap="butt"
              onClick={props.onLayerClick}
              annotation={annotation}
              selected={selected} />
          );
        })}
      </FeatureGroup>
    </LeafletLayerGroup>
  );
});

export default AnnotationLayer;
