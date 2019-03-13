/**
 *
 * Editor
 *
 */

import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import L, { LatLngBounds, LeafletMouseEvent } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import cx from 'classnames';
import { Map, ImageOverlay, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'quinoa-design-library/themes/millet/style.css';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Cover from 'types/Cover';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import AnnotationLayer from 'components/AnnotationLayer';
import Sidebar from 'components/Sidebar';

import {
  createSlideshowAction,
  addAnnotationAction,
  setMap,
} from './actions';
import {
  makeSelectSlideshow,
  makeMapSelector,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles.css';

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
  map: makeMapSelector(),
});

const withConnect = connect(
  mapStateToProps,
  {
    createSlideshow: createSlideshowAction.request,
    createAnnotation: addAnnotationAction,
    setMap: setMap,
  },
);

const withReducer = injectReducer({ key: 'editor', reducer: reducer });
const withSaga = injectSaga({ key: 'editor', saga: saga });

export const decorator = compose(
  withReducer,
  withSaga,
  withConnect,
);

interface EditorProps {
  readonly slideshow: Slideshow;
  readonly selectedAnnotation: number;
  readonly map: L.Map;
  readonly createAnnotation: (frame: LatLngBounds) => void;
  readonly setMap: (event) => void;
}

const minZoom = 8;
const maxZoom = 12;


const geoStyle = (feature) => {
  if (feature.geometry.type === 'Circle') {
    return {
      color: 'red',
    };
  } else {
    return {
      color: 'purple',
    };
  }
};

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.popupContent) {
    layer.bindTooltip(
      feature.properties.popupContent,
      {permanent: true},
    ).openTooltip();
  }
}

function useMapLock(map: L.Map, image: Cover): LatLngBounds {
  const [maxBounds, setMaxBounds] = useState();
  useLayoutEffect(() => {
    if (map !== null) {
      setMaxBounds(
        new L.LatLngBounds(
          map.unproject([0, image.height], map.getMaxZoom()),
          map.unproject([image.width, 0], map.getMaxZoom()),
        ),
      );
    }
  }, [map, image]);
  return maxBounds;
}

const useUrl = (file: File) => {
  const [url] = useState(() => window.URL.createObjectURL(file));
  useEffect(() => {
    return () => {
      window.URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
};

const useFlyTo = (map: L.Map, bounds: LatLngBounds) =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

function EditorMap(props: EditorProps) {
  const {
    slideshow,
    map,
  } = props;
  const maxBounds: LatLngBounds = useMapLock(map, props.slideshow.image);
  useFlyTo(map, maxBounds);
  const [zoomLevel, setZoomLevel] = useState((minZoom + maxZoom) / 2);
  const [addingSlide, setAddingSlide] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [frame, setFrame] = useState();
  const onZoom = useCallback((event: LeafletMouseEvent) => setZoomLevel(event.target.getZoom()), [zoomLevel]);
  const onMouseDown = useCallback((event: LeafletMouseEvent) => {
    if (addingSlide) {
      setDrawing(true);
      setFrame(
        L.latLngBounds(
          event.latlng,
          event.latlng,
        ),
      );
    }
  }, [addingSlide]);
  const onMouseMove = useCallback((event: LeafletMouseEvent) => {
    if (drawing) {
      frame.extend(event.latlng);
      setFrame(
        L.latLngBounds(
          frame.getSouthWest(),
          frame.getNorthEast(),
        ),
      );
    }
  }, [drawing, frame]);
  const onMouseUp = useCallback(() => {
    if (drawing) {
      setDrawing(false);
      props.createAnnotation(frame);
    }
  }, [drawing, frame]);
  const onRectangleClick = useCallback(() => {
    setAddingSlide(state => !state);
  }, []);
  const tg = lef => {
    if (lef && (map !== lef.leafletElement)) {
      props.setMap(lef.leafletElement);
    }
  };
  const imageUrl = useUrl(slideshow.image.file);
  return (
    <div className={cx({
        map: true,
        creating: addingSlide,
      })}>
      <Map
        ref={tg}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        keyboard={false}
        scrollWheelZoom={false}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        maxBounds={maxBounds}
        crs={L.CRS.Simple}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoom={zoomLevel}
        onZoom={onZoom}
        center={[0, 0]}>
        {maxBounds && <ImageOverlay url={imageUrl} bounds={maxBounds} />}
        <AnnotationLayer
          onEachFeature={onEachFeature}
          style={geoStyle}
          key={`${slideshow.id}-${slideshow.annotations.size}`}
          data={slideshow.annotations}
        />
        {(drawing && frame) && <Rectangle className="rectangle" color="red" bounds={frame} />}
        <FloatinBar onRectangleClick={onRectangleClick} />
      </Map>
    </div>
  );
}

function Editor(props: EditorProps & RouterProps) {
  const slideshow = props.slideshow;
  return (
    <div>
      <div className="container">
        <EditorMap {...props} />
      </div>
      <Sidebar annotations={slideshow.annotations} />
    </div>
  );
}

Editor.propTypes = {
  createSlideshow: PropTypes.func.isRequired,
};


export default decorator(props => {
  if (props.slideshow) {
    return <Editor {...props} />;
  }
  return 'loading';
});
