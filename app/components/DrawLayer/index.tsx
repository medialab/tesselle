/**
 *
 * DrawLayer
 *
 */

import * as React from 'react';
import { FeatureGroup, Circle, withLeaflet, MapControlProps } from 'react-leaflet';
import Annotation from 'types/Annotation';
import { List } from 'immutable';

// import styled from 'styles/styled-components';
interface OwnProps extends MapControlProps {
  data: List<Annotation>;
  selectedId?: string;
}

const DrawLayer: React.SFC<OwnProps> = (props: OwnProps) => {
  if (props.leaflet) {
    console.log(props.leaflet.map);
  }
  return (
    <FeatureGroup>
      <Circle center={[51.51, -0.06]} radius={200} />
    </FeatureGroup>
  );
};

export default withLeaflet(DrawLayer);
