/**
 *
 * Editor
 *
 */

import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import L, { LatLngBoundsExpression, LeafletMouseEvent, Point } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import 'leaflet/dist/leaflet.css';
import Control from 'react-leaflet-control';
import { Button } from 'quinoa-design-library';
import 'quinoa-design-library/themes/millet/style.css';
import cx from 'classnames';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectSlideshow, makeSelectSelectedSlide } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { createSlideshowAction, createSlideAction, removeSlideAction } from './actions';
import Slideshow from '../../types/Slideshow';
import { RouterProps } from 'react-router';
import { Map as Mapp, ImageOverlay, Rectangle } from 'react-leaflet';
import Cover from 'types/Cover';
import './styles.css';
import Slide from 'types/Slide';
import SlideTimeline from 'components/SlideTimeline';

const Map = Mapp as any;

interface EditorProps {
  slideshow: Slideshow;
  createSlide: (action: {frame: LatLngBoundsExpression, projected: Point[]}) => any;
  removeSlide: (slide: Slide) => any;
  selectedSlide: number;
}

const minZoom = 8;
const maxZoom = 12;

function useMapLock(ref, image: Cover): [LatLngBoundsExpression, L.Map] {
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

const useFlyTo = (map: L.Map, bounds: LatLngBoundsExpression) =>
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
  const [maxBounds, map]: [LatLngBoundsExpression, L.Map] = useMapLock(ref, slideshow.image);
  useFlyTo(map, selectedSlide ? selectedSlide.bounds : maxBounds);
  const [zoomLevel, setZoomLevel] = useState((minZoom + maxZoom) / 2);
  const [addingSlide, setAddingSlide] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [frame, setFrame] = useState(L.latLngBounds([0, 0], [0, 0]));
  const onZoom = useCallback((event: LeafletMouseEvent) => {
    const z = event.target.getZoom();
    console.log(z);
    return setZoomLevel(z);
  }, [zoomLevel]);
  const createSlide = (): void => {
    setAddingSlide(!addingSlide);
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
      setAddingSlide(false);
      const projected = [
        map.project(
          frame.getSouthWest(), map.getMaxZoom(),
        ),
        map.project(
          frame.getNorthEast(), map.getMaxZoom(),
        ),
      ];
      props.createSlide({frame: frame, projected: projected});
    }
  }, [drawing, frame]);
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
            // boundsOptions={history && history.slide.bounds}
            crs={L.CRS.Simple}
            minZoom={minZoom}
            maxZoom={maxZoom}
            zoom={zoomLevel}
            onZoom={onZoom}
            center={[0, 0]}>
            <ImageOverlay url={window.URL.createObjectURL(slideshow.image.file)} bounds={maxBounds} />
            {drawing && <Rectangle className="rectangle" color="red" bounds={frame} />}
            <Control position="topleft">
              <Button isColor={addingSlide && 'warning'} onClick={createSlide}>+1</Button>
            </Control>
          </Map>
        </div>
        <footer className="slides-container">
          {props.slideshow.slides.map((slide: Slide) => (
            <SlideTimeline onRemove={onSlideRemove} key={slide.id} slide={slide} />
          ))}
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
    removeSlide: removeSlideAction,
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
