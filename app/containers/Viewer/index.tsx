/**
 *
 * Viewer
 *
 */

import React, { useState, useEffect } from 'react';
import { Map, withLeaflet } from 'react-leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectViewer from './selectors';
import reducer from './reducer';
import saga from './saga';
import IiifLayer from 'components/IiifLayer';
import L from 'leaflet';
import { SureContextProps } from 'types';
import { useLockEffect } from 'utils/hooks';
import Slideshow from 'types/Slideshow';

const minZoom = 1;
const maxZoom = 20;

const ViewerMap = withLeaflet<SureContextProps & any>((props) => {
  const params = new URLSearchParams(props.location.search);
  console.log(props.slideshow);
  useLockEffect(props.leaflet.map, props.slideshow.image);
  return (
    <>
      <IiifLayer url={`${params.get('url')}/info.json`} />
    </>
  );
});

function Viewer(props) {
  const params = new URLSearchParams(props.location.search);
  const [slideshow, setSlideshow] = useState<Slideshow>();
  useEffect(() => {
    window.fetch(`${params.get('url')}/slideshow.json`).then(res => res.json()).then(setSlideshow);
  }, []);
  console.log(slideshow);
  return (
    <div className="map player-map">
      <Map
        boxZoom={false}
        dragging={true}
        doubleClickZoom={false}
        zoomControl={false}
        crs={L.CRS.Simple}
        center={[0, 0]}
        minZoom={minZoom}
        maxZoom={maxZoom}>
          {slideshow && <ViewerMap {...props} slideshow={slideshow} />}
        </Map>
    </div>
  );
}

Viewer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  viewer: makeSelectViewer(),
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

const withReducer = injectReducer({ key: 'viewer', reducer: reducer });
const withSaga = injectSaga({ key: 'viewer', saga: saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Viewer);
