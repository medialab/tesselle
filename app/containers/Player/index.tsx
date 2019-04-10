/**
 *
 * Player
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Map, ImageOverlay } from 'react-leaflet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectPlayer from './selectors';
import reducer from './reducer';
import saga from './saga';
import L, { LatLngBounds } from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import { useUrl, useMapLock } from 'utils/hooks';
import 'containers/Editor/styles.css';

const minZoom = 8;
const maxZoom = 12;

function Player(props) {
  const slideshow = props.player;
  const map = props.map;
  const maxBounds: LatLngBounds = useMapLock(map, slideshow.image);
  const imageUrl: string = useUrl(slideshow.image.file);
  return (
    <div className="map">
      <Map
        dragging={false}
        doubleClickZoom={false}
        // zoomControl={false}
        // keyboard={false}
        // scrollWheelZoom={false}
        crs={L.CRS.Simple}
        minZoom={minZoom}
        maxZoom={maxZoom}
        center={[0, 0]}>
        {maxBounds && <ImageOverlay url={imageUrl} bounds={maxBounds} />}
        <AnnotationLayer
          data={slideshow.annotations}
        />
      </Map>>
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  player: makeSelectPlayer(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'player', reducer: reducer });
const withSaga = injectSaga({ key: 'player', saga: saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(props => {
  if (props.player.player && props.player.player.default) {
    return <Player {...props} player={props.player.player.default} map={props.player.player.map} />;
  }
  return <div />;
});
