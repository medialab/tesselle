/**
 *
 * Editor
 *
 */

import React, { useCallback, useState, memo } from 'react';
import L from 'leaflet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { List } from 'immutable';
import { compose } from 'redux';
import { Map, ZoomControl, withLeaflet } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';
import { Feature } from 'geojson';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import Sidebar from 'components/Sidebar';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import AnnotationLayer from 'components/AnnotationLayer';

import {
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
import { useLockEffect } from 'utils/hooks';

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
  selectedAnnotations: makeSelectAnnotationSelector(),
});

const withConnect = connect(
  mapStateToProps,
  {
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

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

  useLockEffect(map, props.slideshow.image);

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
      <IiifLayer tileSize={512} id={props.slideshow.id} />
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
  const onMapClick = useCallback(() => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection();
    }
  }, []);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  const onClose = useCallback(() => setSidebarVisible(false), []);
  const onOpen = useCallback(() => setSidebarVisible(true), []);

  return (
    <div className="map">
      <Sidebar
        slideshow={props.slideshow}
        selectedAnnotations={props.selectedAnnotations}
        visible={sidebarVisible}
        onClose={onClose}
        onOpen={onOpen}
      />
      <Map
        onClick={onMapClick}
        boxZoom={false}
        dragging={false}
        setTool={setTool}
        doubleClickZoom={false}
        zoomControl={false}
        crs={L.CRS.Simple}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}>
          <ZoomControl position="topright" />
          <EditorMapMap {...props} setTool={setTool} tool={tool} />
      </Map>
    </div>
  );
};

const Meditor = memo(Editor);

export default decorator(props => {
  if (props.slideshow) {
    return <Meditor {...props} />;
  }
  return 'loading';
});
