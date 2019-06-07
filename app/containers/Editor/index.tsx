/**
 *
 * Editor
 *
 */

import React, { useCallback, useState, memo, useEffect } from 'react';
import L from 'leaflet';
import { connect, useDispatch } from 'react-redux';
import { pipe } from 'ramda';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Map, ZoomControl, withLeaflet } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';
import { Feature } from 'geojson';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import Slideshow from 'types/Slideshow';
import FloatinBar from 'components/FloatingBar';
import Sidebar from 'components/Sidebar';
import { SupportedShapes, changeSelection, Annotations, SureContextProps } from 'types';
import AnnotationLayer from 'components/AnnotationLayer';

import './style.css';

import {
  addAnnotationAction,
  changeSelectionAction,
  removeAnnotationAction,
  editSlideshowAction,
  editAnnotationAction,
  editOrderAction,
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

export const enhancer = compose(
  withReducer,
  withSaga,
  withConnect,
);

interface EditorProps {
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: Annotations;
  readonly createAnnotation: (frame: Feature) => void;
  readonly changeSelection: changeSelection;
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

const EditorMap = withLeaflet<EditorProps & SetToolsProps & SureContextProps>(props => {
  const {slideshow, setTool, tool} = props;
  const map = props.leaflet.map;

  useLockEffect(map, props.slideshow.image);

  const onSelectClick = useCallback(() => {
    lockFuturShape();
    setTool(SupportedShapes.selector);
  }, []);
  const onRectangleClick = useCallback(() => {
    setTool(SupportedShapes.rectangle);
  }, [map]);
  const onCircleClick = useCallback(() => {
    setTool(SupportedShapes.circle);
  }, [map]);
  const onPolygonClick = useCallback(() => {
    setTool(SupportedShapes.polygon);
  }, [map]);

  useEffect(() => {
    if (tool !== SupportedShapes.selector) {
      switch (tool) {
        case SupportedShapes.rectangle:
          return lockFuturShape(new L.Draw.Rectangle(map));
        case SupportedShapes.circle:
          return lockFuturShape(new L.Draw.Circle(map));
        case SupportedShapes.polygon:
        case SupportedShapes.polyline:
          return lockFuturShape(new L.Draw.Polygon(map));
      }
    }
  });

  useMousetrap('p', onPolygonClick);
  useMousetrap('r', onRectangleClick);
  useMousetrap('c', onCircleClick);
  useMousetrap('esc', onSelectClick);

  const onCreate = useCallback((annotation) => {
    props.createAnnotation(annotation);
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
        editable
        onLayerClick={onLayerClick}
        onCreated={onCreate}
        data={slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations}
      />
      <IiifLayer tileSize={512} id={props.slideshow.image.id} />
      <FloatinBar
        onSelectClick={onSelectClick}
        activeButton={tool}
        onCircleClick={onCircleClick}
        onRectangleClick={onRectangleClick}
        onPolygonClick={onPolygonClick} />
    </React.Fragment>
  );
});

const Editor: React.SFC<EditorProps> = memo((props) => {
  const [tool, setTool] = useState<SupportedShapes>(SupportedShapes.selector);
  const dispatch = useDispatch();
  const onMapClick = useCallback(() => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection();
    }
  }, []);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const onClose = useCallback(() => setSidebarVisible(false), []);
  const onOpen = useCallback(() => setSidebarVisible(true), []);
  const onNameChange = useCallback(pipe(editSlideshowAction, dispatch), []);
  const onRemove = useCallback(pipe(removeAnnotationAction, dispatch), []);
  const onAnnotationClick = useCallback((annotation) => {
    if (!props.selectedAnnotations.includes(annotation)) {
      setTool(SupportedShapes.selector);
      lockFuturShape();
      return props.changeSelection(annotation);
    }
    return;
  }, [props.selectedAnnotations]);
  const onAnnotationChange = useCallback(pipe(editAnnotationAction, dispatch), []);
  const onOrderChange = useCallback(pipe(editOrderAction, dispatch), []);
  return (
    <div className="map">
      <Sidebar
        onAnnotationClick={onAnnotationClick}
        onAnnotationChange={onAnnotationChange}
        onOrderChange={onOrderChange}
        slideshow={props.slideshow}
        selectedAnnotations={props.selectedAnnotations}
        visible={sidebarVisible}
        onClose={onClose}
        onRemove={onRemove}
        onOpen={onOpen}
        onNameChange={onNameChange}
      />
      <Map
        onClick={onMapClick}
        boxZoom={false}
        setTool={setTool}
        doubleClickZoom={false}
        zoomControl={false}
        crs={L.CRS.Simple}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}>
          <ZoomControl position="topright" />
          <EditorMap {...props} setTool={setTool} tool={tool} />
      </Map>
    </div>
  );
});

export default enhancer((props: EditorProps) => {
  if (props.slideshow) {
    return <Editor {...props} />;
  }
  return 'loading';
});
