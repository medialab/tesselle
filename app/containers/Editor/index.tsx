/**
 *
 * Editor
 *
 */

import React, { useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react';
import L, { LatLngBounds } from 'leaflet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { Set } from 'immutable';
import { compose } from 'redux';
import cx from 'classnames';
import { Map, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'quinoa-design-library/themes/millet/style.css';
import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';
import useMousetrap from 'react-hook-mousetrap';
// import { booleanContains } from '@turf/turf';

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
import DrawingLayer from 'components/DrawingLayer';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';
import { Feature } from 'geojson';
import { collision } from 'utils/geo';

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

const useUrl = (file: File): string => {
  const url = useMemo(() => window.URL.createObjectURL(file), [file]);
  useEffect(() => () => window.URL.revokeObjectURL(url), [url]);
  return url;
};

const useFlyTo = (map: L.Map, bounds: LatLngBounds): void =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

// const useToggleTool = (toolState, setToolState, toolToToggle, key) => {
//   const [keyboardMemory, setkeyboardMemory] = useState<SupportedShapes | null>(null);
//   useMousetrap(key, () => {
//     if (!keyboardMemory) {
//       setkeyboardMemory(toolState);
//       setToolState(toolToToggle);
//     }
//   }, 'keydown');
//   useMousetrap(key, () => {
//     console.log(keyboardMemory);
//     setToolState(keyboardMemory);
//     setkeyboardMemory(null);
//   }, 'keyup');
// };

const useTools = (defaultTool): [any, React.Dispatch<any>, (toolToToggle: SupportedShapes, key: string) => void] => {
  const [tool, setTool] = useState<SupportedShapes>(defaultTool);
  const [keyboardMemory, setkeyboardMemory] = useState<SupportedShapes | null>(null);
  function useToggleTool(toolToToggle: SupportedShapes, key: string) {
    useMousetrap(key, () => {
      if (!keyboardMemory) {
        setkeyboardMemory(tool);
        setTool(toolToToggle);
      }
    }, 'keydown');
    useMousetrap(key, () => {
      if (tool === toolToToggle) {
        setTool(keyboardMemory || SupportedShapes.selector);
        setkeyboardMemory(null);
      }
    }, 'keyup');
  }

  return [
    tool,
    (newState) => {
      setTool(newState);
      setkeyboardMemory(null);
    },
    useToggleTool,
  ];
};

function EditorMap(props: EditorProps) {
  const {slideshow, map} = props;
  const imageUrl: string = useUrl(slideshow.image.file);
  const maxBounds: LatLngBounds = useMapLock(map, props.slideshow.image);
  const [tool, setTool, useToggleTool] = useTools(SupportedShapes.selector);

  useToggleTool(SupportedShapes.selector, 'shift');
  useToggleTool(SupportedShapes.edit, 'command');

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
  const onDrown = useCallback((frame) => {
    props.createAnnotation(frame);
    setTool(SupportedShapes.selector);
  }, []);
  const onLayerClick = useCallback((annotation) => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection(annotation);
    }},
    [props.changeSelection, tool],
  );
  const onMapClick = useCallback((event) => {
    if (tool === SupportedShapes.selector) {
      props.changeSelection();
    }
  }, [tool]);
  const onEditClick = useCallback(() => {
    setTool(SupportedShapes.edit);
  }, []);
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
        {(tool !== SupportedShapes.edit) && <DrawingLayer
          onDrown={tool === SupportedShapes.selector
            ? onSelect
            : onDrown
          }
          addingShape={tool}
        />}
        <AnnotationLayer
          onLayerClick={onLayerClick}
          key={`${slideshow.id}-${slideshow.annotations.size}`}
          data={slideshow.annotations}
          selectedAnnotations={props.selectedAnnotations}
          tool={tool}
        />
        <FloatinBar
          onEditClick={onEditClick}
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
      <StretchedLayoutItem isFlex={3}>
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
