/**
 *
 * Editor
 *
 */

import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import L, { LatLngBounds, LeafletMouseEvent, Point } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Map as Mapp, ImageOverlay, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from 'quinoa-design-library';
import 'quinoa-design-library/themes/millet/style.css';
import cx from 'classnames';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Cover from 'types/Cover';
import Slide from 'types/Slide';
import Slideshow from 'types/Slideshow';
import SlideTimeline from 'components/SlideTimeline';
import FloatinBar from 'components/FloatingBar';
import AnnotationLayer from 'components/AnnotationLayer';

import {
  createSlideshowAction,
  createSlideAction,
  removeSlideAction,
  addAnnotationAction,
  changeSlideAction,
} from './actions';
import { makeSelectSlideshow,
  makeSelectSelectedSlide } from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles.css';

const Map = Mapp as any;

interface EditorProps {
  slideshow: Slideshow;
  createSlide: (action: {frame: LatLngBounds, projected: Point[]}) => any;
  removeSlide: (slide: Slide) => any;
  createAnnotation: (frame: LatLngBounds) => void;
  changeSlide: (slide: Slide) => any;
  selectedSlide: number;
}

const minZoom = 8;
const maxZoom = 12;

function useMapLock(ref, image: Cover): [LatLngBounds, L.Map] {
  const [maxBounds, setMaxBounds] = useState();
  const [map, setMap] = useState();
  useLayoutEffect(() => {
    setMaxBounds(new L.LatLngBounds(
      ref.current.leafletElement.unproject([0, image.height], ref.current.leafletElement.getMaxZoom()),
      ref.current.leafletElement.unproject([image.width, 0], ref.current.leafletElement.getMaxZoom()),
    ));
    setMap(ref.current.leafletElement);
  }, [ref, image]);
  return [maxBounds, map];
}

const useFlyTo = (map: L.Map, bounds: LatLngBounds) =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

function Editor(props: EditorProps & RouterProps) {
  const slideshow = props.slideshow;
  const onSlideRemove = props.removeSlide;
  const selectedSlide: null | Slide = slideshow.slides[props.selectedSlide - 1];

  const ref = useRef();
  const [maxBounds, map]: [LatLngBounds, L.Map] = useMapLock(ref, slideshow.image);
  useFlyTo(map, maxBounds);
  const [zoomLevel, setZoomLevel] = useState((minZoom + maxZoom) / 2);
  const [addingSlide, setAddingSlide] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [frame, setFrame] = useState(maxBounds);
  const onZoom = useCallback((event: LeafletMouseEvent) =>
    setZoomLevel(event.target.getZoom())
  , [zoomLevel]);
  const createSlide = (): void => {
    const bounds = maxBounds;
    const projected = [
      map.project(
        bounds.getSouthWest(), map.getMaxZoom(),
      ),
      map.project(
        bounds.getNorthEast(), map.getMaxZoom(),
      ),
    ];
    props.createSlide({frame: bounds, projected: projected});
  };
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
  return (
    <div>
      <div className="container">
        <div className={cx({
          map: true,
          creating: addingSlide,
        })}>
          <Map
            ref={ref}
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
            <ImageOverlay url={window.URL.createObjectURL(slideshow.image.file)} bounds={maxBounds} />
            {(drawing && frame) && <Rectangle className="rectangle" color="red" bounds={frame} />}
            {(selectedSlide && selectedSlide.annotations.length > 0) && (
              <AnnotationLayer key={selectedSlide.id} data={selectedSlide.annotations as any} />
            )}
            <FloatinBar onRectangleClick={onRectangleClick} />
          </Map>
        </div>
        <footer className="slides-container">
          {props.slideshow.slides.map((slide: Slide) => (
            <SlideTimeline
              onRemove={onSlideRemove}
              onClick={props.changeSlide}
              key={slide.id}
              selected={selectedSlide && selectedSlide.id === slide.id}
              slide={slide} />
          ))}
          <div className="timeline__slide-container">
            <Button className="timeline__slide-add-buttom" isRounded isColor="error" onClick={createSlide}>+1</Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

Editor.propTypes = {
  createSlideshow: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
  selectedSlide: makeSelectSelectedSlide(),
});

const withConnect = connect(
  mapStateToProps,
  {
    createSlideshow: createSlideshowAction.request,
    createSlide: createSlideAction.request,
    createAnnotation: addAnnotationAction,
    removeSlide: removeSlideAction,
    changeSlide: changeSlideAction,
  },
);

const withReducer = injectReducer({ key: 'editor', reducer: reducer });
const withSaga = injectSaga({ key: 'editor', saga: saga });

export const decorator = compose(
  withReducer,
  withSaga,
  withConnect,
);

export default decorator(props => props.slideshow && <Editor {...props} />);
