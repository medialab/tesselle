/**
 *
 * Editor
 *
 */

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import L, { LatLngBoundsExpression } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import 'leaflet/dist/leaflet.css';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectSlideshow } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { createSlideshowAction } from './actions';
import Slideshow from '../../types/Slideshow';
import { RouterProps } from 'react-router';
import { Map, ImageOverlay } from 'react-leaflet';
import Cover from 'types/Cover';
import './styles.css';

interface EditorProps {
  slideshow: Slideshow;
}

const minZoom = 8;
const maxZoom = 12;

function useMapLock(ref, image: Cover): [LatLngBoundsExpression, L.Map] {
  const [maxBounds, setMaxBounds] = useState();
  const [map, setMap] = useState();
  useLayoutEffect(() => {
    setMaxBounds(new L.LatLngBounds(
      ref.current.leafletElement.unproject([0, image.height], 10),
      ref.current.leafletElement.unproject([image.width, 0], 10),
    ));
    setMap(ref.current.leafletElement);
  }, [ref, image]);
  return [maxBounds, map];
}

const useFlyTo = (map: L.Map, bounds: LatLngBoundsExpression) =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

function Editor(props: EditorProps & RouterProps) {
  const slideshow = props.slideshow;
  const ref = useRef();
  const [maxBounds, map]: [LatLngBoundsExpression, L.Map] = useMapLock(ref, slideshow.image);
  useFlyTo(map, maxBounds);
  return (
    <div>
      <Helmet>
        <title>Editor</title>
        <meta name="description" content="Description of Editor" />
      </Helmet>
      <div>
        <Map
          ref={ref}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          keyboard={false}
          scrollWheelZoom={false}
          maxBounds={maxBounds}
          crs={L.CRS.Simple}
          minZoom={minZoom}
          maxZoom={maxZoom}
          center={[0, 0]}>
          <ImageOverlay url={window.URL.createObjectURL(slideshow.image.file)} bounds={maxBounds} />
        </Map>
      </div>
    </div>
  );
}

Editor.propTypes = {
  createSlideshow: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
});

const withConnect = connect(
  mapStateToProps,
  {createSlideshow: createSlideshowAction.request},
);

const withReducer = injectReducer({ key: 'editor', reducer: reducer });
const withSaga = injectSaga({ key: 'editor', saga: saga });

export const decorator = compose(
  withReducer,
  withSaga,
  withConnect,
);

export default decorator(props => props.slideshow && <Editor {...props} />);
