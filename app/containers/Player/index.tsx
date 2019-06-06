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
import { enhancer } from 'containers/Editor';
import ReactDOM from 'react-dom';
import Sidebar from './Sidebar';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import Annotation from 'types/Annotation';
import { SureContextProps, changeSelection } from 'types';

import './style.css';

const minZoom = 1;
const maxZoom = 20;

interface PlayerProps {
  readonly playing: boolean;
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: List<Annotation>;
  readonly changeSelection: changeSelection;
}

const PlayerMap = withLeaflet<SureContextProps & PlayerProps>((props) => {
  const selected = props.selectedAnnotations.first();
  useLockEffect(props.leaflet.map, (selected && props.playing) ? selected : props.slideshow.image);
  return (
    <React.Fragment>
      <AnnotationLayer
        data={props.slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations} />
      <IiifLayer tileSize={512} id={props.slideshow.image.id} />
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

const Player: React.SFC<PlayerProps> = (props) => {
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
    <div className="map player-map">
      <div ref={sidebarReady} />
      <Map
        boxZoom={false}
        dragging={true}
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
            changeSelection={props.changeSelection}
            selectedAnnotations={props.selectedAnnotations} />
      </Map>
    </div>
  );
};

export default enhancer(props => {
  if (props.slideshow) {
    return (<Player {...props} />);
  }
  return <div />;
});
