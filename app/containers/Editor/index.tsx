/**
 *
 * Editor
 *
 */

import React, { useCallback } from 'react';
import L, { LatLngBounds } from 'leaflet';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { Set } from 'immutable';
import { compose } from 'redux';
import cx from 'classnames';
import { Map, ImageOverlay } from 'react-leaflet';
import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import AnnotationLayer from 'components/AnnotationLayer';
import Sidebar from 'components/Sidebar';
import DrawingLayer from 'components/DrawingLayer';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import { Feature } from 'geojson';
import { collision } from 'utils/geo';
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

const EditorMap: React.SFC<EditorProps> = (props) => {
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
  const onDrown = useCallback(props.createAnnotation, []);
  const onLayerClick = useCallback((annotation) => {
      if (tool === SupportedShapes.selector) {
        props.changeSelection(annotation);
      }
    },
    [props.changeSelection, tool],
  );
  const onMapClick = useCallback((event) => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection();
    }
  }, [tool]);
  const onSelect = useCallback((feature: Feature) => {
    const selected = collision(feature, slideshow.annotations.toJS());
    props.changeSelection(
      slideshow.annotations.filter(
        (_, index) => selected[index],
      ).toSet(),
    );
  }, [props.slideshow]);
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
        {(tool !== SupportedShapes.selector) && <DrawingLayer
          onDrown={tool === SupportedShapes.selector
            ? onSelect
            : onDrown
          }
          addingShape={tool}
        />}
        <AnnotationLayer
          onLayerClick={onLayerClick}
          data={slideshow.annotations}
          selectedAnnotations={props.selectedAnnotations}
          tool={tool}
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
};

const Editor: React.SFC<EditorProps & RouterProps> = React.memo((props) => (
  <StretchedLayoutContainer
    isFullHeight
    isDirection="horizontal">
    <StretchedLayoutItem isFlex={1} style={{padding: '1rem', overflow: 'auto'}}>
      <Sidebar annotations={props.slideshow.annotations} selectedAnnotations={props.selectedAnnotations} />
    </StretchedLayoutItem>
    <StretchedLayoutItem isFlex={2}>
      <EditorMap {...props} />
    </StretchedLayoutItem>
  </StretchedLayoutContainer>
));

export default decorator(props => {
  if (props.slideshow) {
    return <Editor {...props} />;
  }
  return 'loading';
});
