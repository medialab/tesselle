/**
 *
 * Editor
 *
 */

import React, { useCallback, useState } from 'react';
import L, { LatLngBounds } from 'leaflet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { List } from 'immutable';
import { compose } from 'redux';
import { Map, withLeaflet } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
// import Sidebar from 'components/Sidebar';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import { Feature } from 'geojson';
import { useFlyTo, useMapLock } from 'utils/hooks';
import AnnotationLayer from 'components/AnnotationLayer';

import {
  createSlideshowAction,
  addAnnotationAction,
  changeSelectionAction,
} from './actions';
import {
  makeSelectSlideshow,
  makeSelectAnnotationSelector,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import IiifLayer from 'components/IiifLayer';

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
  selectedAnnotations: makeSelectAnnotationSelector(),
});

const withConnect = connect(
  mapStateToProps,
  {
    createSlideshow: createSlideshowAction.request,
    createAnnotation: addAnnotationAction,
    changeSelection: changeSelectionAction,
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
}

interface SetToolsProps {
  setTool: (SupportedShapes) => void;
  tool: SupportedShapes;
}

const minZoom = 1;
const maxZoom = 20;

// Hack to allow only 1 futur shape to be drawn.
let FUTUR_SHAPE;
const lockFuturShape = (instance?) => {
  if (FUTUR_SHAPE) {
    FUTUR_SHAPE.disable();
  }
  FUTUR_SHAPE = instance;
  if (instance) {
    instance.enable();
  }
};

const EditorMap: React.ComponentType<Pick<EditorProps & SetToolsProps, any>> = props => {
  const {slideshow, setTool, tool} = props;
  const map = props.leaflet.map;
  const maxBounds: LatLngBounds = useMapLock(map, slideshow.image);

  const onSelectClick = useCallback(() => {
    lockFuturShape();
    setTool(SupportedShapes.selector);
  }, []);
  const onRectangleClick = useCallback(() => {
    lockFuturShape(new L.Draw.Rectangle(map));
    setTool(SupportedShapes.rectangle);
  }, [map]);
  const onCircleClick = useCallback(() => {
    lockFuturShape(new L.Draw.Circle(map));
    setTool(SupportedShapes.circle);
  }, [map]);
  const onPolygonClick = useCallback(() => {
    lockFuturShape(new L.Draw.Polygon(map));
    setTool(SupportedShapes.polygon);
  }, [map]);

  useFlyTo(map, maxBounds);

  useMousetrap('p', onPolygonClick);
  useMousetrap('r', onRectangleClick);
  useMousetrap('c', onCircleClick);
  useMousetrap('esc', onSelectClick);

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

  return (
    <React.Fragment>
      <AnnotationLayer
        onLayerClick={onLayerClick}
        onCreated={onCreate}
        data={slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations}
      />
      <IiifLayer tileSize={512} />
      <FloatinBar
        onSelectClick={onSelectClick}
        activeButton={tool}
        onCircleClick={onCircleClick}
        onRectangleClick={onRectangleClick}
        onPolygonClick={onPolygonClick} />
    </React.Fragment>
  );
};

const EditorMapMap = withLeaflet(EditorMap);

const Editor: React.SFC<EditorProps> = (props) => {
  const [tool, setTool] = useState<SupportedShapes>(SupportedShapes.selector);
  const onMapClick = useCallback((event) => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection();
    }
  }, []);
  return (
    <div className="map">
      <Map
        onClick={onMapClick}
        boxZoom={false}
        dragging={false}
        setTool={setTool}
        doubleClickZoom={false}
        // zoomControl={false}
        // keyboard={false}
        // scrollWheelZoom={false}
        crs={L.CRS.Simple}
        minZoom={minZoom}
        maxZoom={maxZoom}>
          <EditorMapMap {...props} />
      </Map>
    </div>
  );
};

export default decorator(props => {
  if (props.slideshow) {
    return <Editor {...props} />;
  }
  return 'loading';
});
