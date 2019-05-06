/**
 *
 * Player
 *
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Map, withLeaflet, MapLayerProps } from 'react-leaflet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import useMousetrap from 'react-hook-mousetrap';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectPlayer from './selectors';
import reducer from './reducer';
import saga from './saga';
import cx from 'classnames';

import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';
import L, { LatLngBounds } from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import IiifLayer from 'components/IiifLayer';
import { List } from 'immutable';
import { SupportedShapes } from 'types';
import Slideshow from 'types/Slideshow';
import { useMapLock, useFlyTo } from 'utils/hooks';
import Annotation from 'types/Annotation';
import { coordsToLatLngs } from 'utils/geo';
import { circle } from '@turf/turf';

const mapStateToProps = createStructuredSelector({
  player: makeSelectPlayer(),
});

const withConnect = connect(mapStateToProps);

const withReducer = injectReducer({ key: 'player', reducer: reducer });
const withSaga = injectSaga({ key: 'player', saga: saga });

const decorator = compose(
  withReducer,
  withSaga,
  withConnect,
);

interface PlayerProps extends MapLayerProps {
  readonly slideshow: Slideshow;
}

const minZoom = 1;
const maxZoom = 20;

const PlayerMap: React.ComponentType<Pick<PlayerProps, any>> = withLeaflet(props => {
  const [selected, setSelected] = useState<Annotation>();
  useMousetrap('k', () => {
    if (selected) {
      const index = props.slideshow.annotations.indexOf(selected);
      if (index < props.slideshow.annotations.size) {
        setSelected(props.slideshow.annotations.get(index + 1));
      }
    } else {
      setSelected(props.slideshow.annotations.first());
    }
  });
  useMousetrap('j', () => {
    if (selected) {
      const index = props.slideshow.annotations.indexOf(selected);
      if (index > 0) {
        setSelected(props.slideshow.annotations.get(index - 1));
      }
    } else {
      setSelected(props.slideshow.annotations.first());
    }
  });
  if (props.leaflet) {
    const maxBounds: LatLngBounds = useMapLock(props.leaflet.map, props.slideshow.image);
    let zoomTo = maxBounds;
    if (selected) {
      const geometry: any = selected.type === 'Feature' ? selected.geometry : selected;
      const coordsLevels = geometry.type === 'Polygon' ? 1 : 2;
      if (selected.properties.type === SupportedShapes.circle) {
        console.log('radius', selected.properties.radius);
        const chiant = circle(selected.toJS(), selected.properties.radius);
        zoomTo = coordsToLatLngs(
          (chiant.geometry as any).coordinates,
          1,
        );
        console.log(zoomTo);
      } else {
        zoomTo = coordsToLatLngs(
          (selected.geometry as any).coordinates,
          coordsLevels,
        ).toJS();
        console.log(zoomTo);
      }
    }
    useFlyTo(props.leaflet.map, zoomTo);
  } else {
    throw new Error('This component did not get it\'s map property.');
  }

  return (
    <React.Fragment>
      <AnnotationLayer
        data={props.slideshow.annotations}
        selectedAnnotations={List(selected ? [selected] : [])}
      />
      <IiifLayer tileSize={512} />
    </React.Fragment>
  );
});

function Player(props) {
  return (
    <div className={cx({
      map: true,
      creating: SupportedShapes.selector,
    })}>
      <Map
        boxZoom={false}
        dragging
        doubleClickZoom={false}
        crs={L.CRS.Simple}
        center={[0, 0]}
        minZoom={minZoom}
        maxZoom={maxZoom}>
        <PlayerMap slideshow={props.player} />
      </Map>
    </div>
  );
}

export default decorator(props => {
  if (props.player) {
    return (
      <StretchedLayoutContainer
        isFullHeight
        isDirection="horizontal">
          <StretchedLayoutItem isFlex={2}>
            <Player {...props} />
          </StretchedLayoutItem>
      </StretchedLayoutContainer>
    );
  }
  return <div />;
});
