/**
 *
 * Editor
 *
 */

import React, { useCallback, useState } from 'react';
import L, { LatLngBounds } from 'leaflet';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { List } from 'immutable';
import { compose } from 'redux';
import cx from 'classnames';
import { Map } from 'react-leaflet';
import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';
import useMousetrap from 'react-hook-mousetrap';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import Sidebar from 'components/Sidebar';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import { Feature } from 'geojson';
import { useFlyTo, useMapLock } from 'utils/hooks';
import AnnotationLayer from 'components/AnnotationLayer';

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
import IiifLayer from 'components/IiifLayer';

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
  readonly selectedAnnotations: List<Annotation>;
  readonly map: L.Map;
  readonly createAnnotation: (frame: Feature) => void;
  readonly changeSelection: (annotation?: Annotation | List<Annotation>) => void;
  readonly setMap: (event) => void;
}

const minZoom = 1;
const maxZoom = 20;
const EditorMap: React.SFC<EditorProps> = (props) => {
  const {slideshow, map} = props;
  const imageUrl: string = 'http://localhost:3000/test-image/info.json';
  const maxBounds: LatLngBounds = useMapLock(map, slideshow.image);
  const [tool, setTool] = useState<SupportedShapes>(SupportedShapes.selector);

  const onSelectClick = useCallback(() => {
    setTool(SupportedShapes.selector);
  }, []);
  const onRectangleClick = useCallback(() => {
    new L.Draw.Rectangle(map).enable();
    setTool(SupportedShapes.rectangle);
  }, [map]);
  const onCircleClick = useCallback(() => {
    setTool(SupportedShapes.circle);
    new L.Draw.Circle(map).enable();
  }, [map]);
  const onPolygonClick = useCallback(() => {
    new L.Draw.Polygon(map).enable();
    setTool(SupportedShapes.polygon);
  }, [map]);

  useFlyTo(map, maxBounds);

  useMousetrap('p', onPolygonClick);
  useMousetrap('r', onRectangleClick);
  useMousetrap('c', onCircleClick);

  const onCreate = useCallback((annotation) => {
    props.createAnnotation(annotation);
    setTool(SupportedShapes.selector);
  }, []);
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
  const reactLeafletDangerousRef = lef => {
    if (lef && (map !== lef.leafletElement)) {
      props.setMap(lef.leafletElement);
    }
  };

  return (
    <div className={cx({
        map: true,
        creating: tool,
      })}>
      <Map
        boxZoom={false}
        editable
        onClick={onMapClick}
        ref={reactLeafletDangerousRef}
        dragging={false}
        doubleClickZoom={false}
        // zoomControl={false}
        // keyboard={false}
        // scrollWheelZoom={false}
        crs={L.CRS.Simple}
        minZoom={minZoom}
        maxZoom={maxZoom}>
        <AnnotationLayer
          onLayerClick={onLayerClick}
          onCreated={onCreate}
          data={slideshow.annotations}
          selectedAnnotations={props.selectedAnnotations}
        />
        <IiifLayer url={imageUrl} tileSize={512} />
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

const Editor: React.SFC<EditorProps & RouterProps> = (props) => (
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
);

export default decorator(props => {
  if (props.slideshow) {
    return <Editor {...props} />;
  }
  return 'loading';
});
