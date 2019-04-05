/**
 *
 * Editor
 *
 */

import React, { useCallback } from 'react';
import L, { LatLngBounds } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { Set } from 'immutable';
import { compose } from 'redux';
import cx from 'classnames';
import { Map, ImageOverlay } from 'react-leaflet';
import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';
// import { booleanContains } from '@turf/turf';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import Sidebar from 'components/Sidebar';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import { Feature } from 'geojson';
import { useTools, useFlyTo, useUrl, useMapLock } from 'utils/hooks';

import {
  createSlideshowAction,
  addAnnotationAction,
  setMap,
  changeSelectionAction,
} from './actions';
import {
  makeSelectSlideshow,
  makeMapSelector,
  makeSelectAnnotationSelector,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles.css';
import FigureEditor from 'components/FigureEditor';
// import FigureEditor from 'react-leaflet-figure-editor';

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
  map: makeMapSelector(),
  selectedAnnotations: makeSelectAnnotationSelector(),
});

const withConnect = connect(
  mapStateToProps,
  {
    createSlideshow: createSlideshowAction.request,
    createAnnotation: addAnnotationAction,
    changeSelection: changeSelectionAction,
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
  readonly selectedAnnotations: Set<Annotation>;
  readonly map: L.Map;
  readonly createAnnotation: (frame: Feature) => void;
  readonly changeSelection: (annotation?: Annotation | Set<Annotation>) => void;
  readonly setMap: (event) => void;
}

const minZoom = 8;
const maxZoom = 12;

function EditorMap(props: EditorProps) {
  const {slideshow, map} = props;
  const imageUrl: string = useUrl(slideshow.image.file);
  const maxBounds: LatLngBounds = useMapLock(map, slideshow.image);
  const [tool, setTool, useToggleTool] = useTools(SupportedShapes.selector);

  useToggleTool(SupportedShapes.selector, 'shift');

  const onSelectClick = useCallback(() => {
    setTool(SupportedShapes.selector);
  }, []);
  const onRectangleClick = useCallback(() => {
    setTool(SupportedShapes.rectangle);
  }, []);
  const onCircleClick = useCallback(() => {
    setTool(SupportedShapes.circle);
  }, []);
  const onPolygonClick = useCallback(() => {
    setTool(SupportedShapes.polygon);
  }, []);
  const onMapClick = useCallback(() => {
    if (tool === SupportedShapes.selector) {
      // props.changeSelection();
    }
  }, [tool]);
  const reactLeafletDangerousRef = lef => {
    if (lef && (map !== lef.leafletElement)) {
      props.setMap(lef.leafletElement);
    }
  };

  useFlyTo(map, maxBounds);

  return (
    <div className={cx({
        map: true,
        creating: tool,
      })}>
      <Map
        editable
        onClick={onMapClick}
        ref={reactLeafletDangerousRef}
        dragging={false}
        doubleClickZoom={false}
        // zoomControl={false}
        // keyboard={false}
        // scrollWheelZoom={false}
        maxBounds={maxBounds}
        crs={L.CRS.Simple}
        minZoom={minZoom}
        maxZoom={maxZoom}
        center={[0, 0]}>
        {maxBounds && <ImageOverlay url={imageUrl} bounds={maxBounds} />}
        <FigureEditor
          data={slideshow.annotations}
          selectedId={props.selectedAnnotations.size >= 1
            ? (props.selectedAnnotations.first() as Annotation).properties.id
            : undefined}
        />
        <FloatinBar
          onSelectClick={onSelectClick}
          activeButton={tool}
          onCircleClick={onCircleClick}
          onRectangleClick={onRectangleClick}
          onPolygonClick={onPolygonClick} />
      </Map>
    </div>
  );
}

function Editor(props: EditorProps & RouterProps) {
  const slideshow = props.slideshow;
  return (
    <StretchedLayoutContainer
      isFullHeight
      isDirection="horizontal">
      <StretchedLayoutItem isFlex={1} style={{padding: '1rem', overflow: 'auto'}}>
        <Sidebar annotations={slideshow.annotations} selectedAnnotations={props.selectedAnnotations} />
      </StretchedLayoutItem>
      <StretchedLayoutItem isFlex={2}>
        <EditorMap {...props} />
      </StretchedLayoutItem>
    </StretchedLayoutContainer>
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
