/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup, withLeaflet, MapLayer, MapLayerProps } from 'react-leaflet';
import React from 'react';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { LayerGroup as LeafletLayerGroup } from 'leaflet';

interface AnnotationLayerProps extends MapLayerProps {
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

class AnnotationLayer extends MapLayer<AnnotationLayerProps> {

  public componentDidMount() {
    if (this.props.leaflet && this.props.leaflet.map) {
      this.props.leaflet.map.on('editable:dragend', console.log);
    } else {
      throw new Error('Map did have not been given. Could not put edition listeners.');
    }
  }

  public createLeafletElement(props) {
    const el = new LeafletLayerGroup([], this.getOptions(props));
    this.contextValue = { ...props.leaflet, layerContainer: el };
    return el;
  }
  public render() {
    return (
      <LayerGroup>
        {this.props.data.map((annotation) =>
          <React.Fragment key={annotation.properties.id}>
            <GuessComponent annotation={annotation} />
          </React.Fragment>,
        )}
      </LayerGroup>
    );
  }
}

export default withLeaflet(AnnotationLayer);
