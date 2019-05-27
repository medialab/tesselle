/**
 *
 * Player
 *
 */

import React, { useCallback, useRef, useState } from 'react';
import { Map, withLeaflet, ZoomControl } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';

import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import IiifLayer from 'components/IiifLayer';
import { useLockEffect, useToggleBoolean } from 'utils/hooks';
import { enhancer, EditorProps } from 'containers/Editor';
import 'components/Sidebar/styles.css';
import ReactDOM from 'react-dom';
import { Sidebar } from './Sidebar';

const minZoom = 1;
const maxZoom = 20;

const PlayerMap = withLeaflet((props: Pick<EditorProps, any>) => {
  const selected = props.selectedAnnotations.first();
  useLockEffect(props.leaflet.map, (selected && props.playing) ? selected : props.slideshow.image);
  return (
    <React.Fragment>
      <AnnotationLayer
        data={props.slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations} />
      <IiifLayer tileSize={512} id={props.slideshow.id} />
    </React.Fragment>
  );
});

export const selectNext = (selected, annotations) => {
  if (!selected) {
    return annotations.first();
  }
  const index = annotations.indexOf(selected);
  if (index + 1 < annotations.size) {
    return annotations.get(index + 1);
  } else {
    return annotations.first();
  }
};

function Player(props) {
  const selected = props.selectedAnnotations.first();

  const [mountSidebar, setMountSidebar] = useState<boolean>(false);
  const [sidebarVisible, onClose, onOpen] = useToggleBoolean();
  const onNext = useCallback(
    () => props.changeSelection(selectNext(selected, props.slideshow.annotations)),
    [selected, props.slideshow.annotations],
  );
  const onPrev = useCallback(
    () => props.changeSelection(selectNext(selected, props.slideshow.annotations.reverse())),
    [selected, props.slideshow.annotations],
  );
  useMousetrap('k', onNext);
  useMousetrap('j', onPrev);
  const onMapClick = useCallback((event) => props.changeSelection(), [props.changeSelection]);
  const sidebarRef = useRef<Element | null>(null);
  const sidebarReady = (domElement) => {
    sidebarRef.current = domElement;
    setMountSidebar(!!domElement);
  };

  return (
    <div className="map">
      <div ref={sidebarReady} />
      <Map
        boxZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        crs={L.CRS.Simple}
        onClick={onMapClick}
        center={[0, 0]}
        minZoom={minZoom}
        maxZoom={maxZoom}>
          {(sidebarRef.current && mountSidebar) && ReactDOM.createPortal(
            <Sidebar
              slideshow={props.slideshow}
              selectedAnnotations={props.selectedAnnotations}
              visible={sidebarVisible}
              onClose={onClose}
              onOpen={onOpen}
              onPrev={onPrev}
              onNext={onNext}
              changeSelection={props.changeSelection}
            />,
            sidebarRef.current,
          )}
          <ZoomControl position="topright" />
          <PlayerMap
            playing={!sidebarVisible}
            slideshow={props.slideshow}
            selectedAnnotations={props.selectedAnnotations} />
      </Map>
    </div>
  );
}

export default enhancer(props => {
  if (props.slideshow) {
    return (<Player {...props} />);
  }
  return <div />;
});
