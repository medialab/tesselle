/**
 *
 * AnnotationLayer
 *
 */
import 'leaflet-draw/dist/leaflet.draw.css';

import { LayerGroup as LeafletLayerGroup, withLeaflet, MapLayerProps, FeatureGroup } from 'react-leaflet';
import React, { useCallback, useRef } from 'react';
import { SupportedShapes } from 'types';
import { DomEvent } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import useDebouncedCallback from 'use-debounce/lib/callback';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';
import AnnotationRectangle from './AnnotationRectangle';
import { fromJS } from 'utils/geo';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
  selectedAnnotations?: List<Annotation>;
  leaflet;
  onLayerClick?: (annotation: Annotation) => any;
  tool?: SupportedShapes;
  onCreated?: any;
}

const GuessComponent = ({annotation, selected, map, onClick, tool}: AnnotationShapes) => {
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
            annotation={annotation} />
        );
      }
      return (
        <AnnotationPolygon
          onClick={onLayerClick}
          tool={tool}
          map={map}
          selected={selected}
          annotation={annotation} />
      );
  }
  return <React.Fragment />;
};

const createLogger = str => args => console.log(str, args);

const AnnotationLayer = (props: AnnotationLayerProps) => {
  let data = props.data;
  if (props.selectedAnnotations) {
    const annotations = props.selectedAnnotations;
    data = props.data.filter(annotation => !annotations.contains(annotation));
  }
  const renderAnnotations = (annotation) => (
    <React.Fragment key={annotation.properties.id}>
      <GuessComponent
        tool={props.tool}
        onClick={props.onLayerClick}
        map={props.leaflet.map}
        annotation={annotation}
        selected={(!!props.selectedAnnotations) && props.selectedAnnotations.contains(annotation)} />
    </React.Fragment>
  );

  const dispatch = useDispatch();

  const rawOnEdit = () => {
    if (props.selectedAnnotations && containerRef.current && props.onCreated) {
      const featuresCollection = List(containerRef.current.leafletElement.getLayers());
      props.selectedAnnotations.zip(featuresCollection).forEach(([annotation, layer]) => {
        const feature = (layer as any).toGeoJSON();
        if (annotation.properties.type === SupportedShapes.circle) {
          dispatch(
            editAnnotationAction(
              annotation,
              annotation.set(
                'geometry',
                fromJS(feature.geometry),
              ).setIn(
                ['properties', 'radius'],
                (layer as L.CircleMarker).getRadius(),
              ),
            ));
        } else {
          dispatch(
            editAnnotationAction(
              annotation,
              fromJS(feature).set('properties', annotation.properties),
            ),
          );
        }
      });
      return;
    }
  };

  const onEdit = useCallback(rawOnEdit, [props.selectedAnnotations, props.onCreated]);
  const [debouncedOnEdit] = useDebouncedCallback(onEdit, 200);
  const onCreate = useCallback((event) => {
    if (event.layerType === SupportedShapes.circle) {
      const feature = event.layer.toGeoJSON();
      feature.properties.radius = (event.layer as L.CircleMarker).getRadius();
      return props.onCreated(feature);
    }
    const feature = event.layer.toGeoJSON();
    feature.properties.type = event.layerType;
    return props.onCreated(feature);
  }, []);

  const containerRef = useRef<FeatureGroup>(null);

  return (
    <LeafletLayerGroup>
      {data.map(renderAnnotations)}
      <FeatureGroup ref={containerRef}>
        <EditControl
          position="topright"
          onEdited={onEdit}
          onCreated={onCreate}
          onDeleted={createLogger('onDeleted')}
          onEditStart={createLogger('onEditStart')}
          onEditStop={createLogger('onEditStop')}
          onDeleteStart={createLogger('onDeleteStart')}
          onDeleteStop={createLogger('onDeleteStop')}
          onDrawStart={createLogger('onDrawStart')}
          onDrawStop={createLogger('onDrawStop')}
          onDrawVertex={createLogger('onDrawVertex')}
          onEditMove={debouncedOnEdit}
          onEditResize={debouncedOnEdit}
        />
        {props.selectedAnnotations && props.selectedAnnotations.map(renderAnnotations)}
      </FeatureGroup>
    </LeafletLayerGroup>
  );
};

export default withLeaflet(AnnotationLayer);
