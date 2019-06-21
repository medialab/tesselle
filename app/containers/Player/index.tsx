/**
 *
 * Player
 *
 */

import React, { useCallback, useRef, useState } from 'react';
import { Map, withLeaflet, ZoomControl } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';
import { Button, Icon, Title } from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import Modal from 'react-modal';

import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import Loader from 'components/Loader';
import { LocalIiifLayer, DistantIiifLayer } from 'components/IiifLayer';
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

Modal.setAppElement('#app');

interface PlayerContainerProps {
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: List<Annotation>;
  readonly changeSelection: changeSelection;
  readonly url?: string;
  readonly viewerMode?: boolean;
}

interface PlayerProps extends PlayerContainerProps {
  readonly playing: boolean;
}

const PlayerMap = withLeaflet<SureContextProps & PlayerProps>((props) => {
  const selected = props.selectedAnnotations.first<Annotation<any, any>>();
  const isInvisible = selected && selected.geometry.type === 'LineString';
  useLockEffect(props.leaflet.map, (selected && props.playing) ? selected : props.slideshow.image, isInvisible);
  return (
    <React.Fragment>
      <AnnotationLayer
        data={props.slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations} />
      {props.url ?
        <DistantIiifLayer url={props.url} /> :
        <LocalIiifLayer tileSize={512} id={props.slideshow.image.id} />}
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

export const Player: React.SFC<PlayerContainerProps> = (props) => {
  const selected = props.selectedAnnotations.first();
  const [mountSidebar, setMountSidebar] = useState<boolean>(false);
  const [isShareHelpOpen, setShareHelpOpen] = useState<boolean>(false);
  const [sidebarVisible, onClose, onOpen] = useToggleBoolean();
  const onPlay = useCallback(() => {
    onOpen();
    if (!selected) {
      onNext();
    }
  }, [onOpen]);
  const noop = undefined;
  const onNext = useCallback(
    props.slideshow.annotations.size > 1 ?
      () => props.changeSelection(selectNext(selected, props.slideshow.annotations)) : noop as any,
    [selected, props.slideshow.annotations],
  );
  const onPrev = useCallback(
    props.slideshow.annotations.size > 1 ?
      () => props.changeSelection(selectNext(selected, props.slideshow.annotations.reverse())) : noop as any,
    [selected, props.slideshow.annotations],
  );
  useMousetrap('k', onNext);
  useMousetrap('j', onPrev);
  const onMapClick = useCallback((event) => {
    if (sidebarVisible) {
      return props.changeSelection();
    }
  }, [sidebarVisible, props.changeSelection]);
  const toggleShareHelpOpen = useCallback(() => setShareHelpOpen(!isShareHelpOpen), [isShareHelpOpen]);
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
        minZoom={minZoom}
        maxZoom={maxZoom}>
          {(sidebarRef.current && mountSidebar) && ReactDOM.createPortal(
            <Sidebar
              slideshow={props.slideshow}
              selectedAnnotations={props.selectedAnnotations}
              visible={sidebarVisible}
              onClose={onClose}
              onOpen={onPlay}
              onPrev={onPrev}
              onNext={onNext}
              changeSelection={props.changeSelection}
              viewerMode={props.viewerMode}
            />,
            sidebarRef.current,
          )}
        <ZoomControl position="topright" />
        <PlayerMap
          url={props.url}
          playing={!sidebarVisible}
          slideshow={props.slideshow}
          changeSelection={props.changeSelection}
          selectedAnnotations={props.selectedAnnotations}
        />
      </Map>
      {
        props.viewerMode &&
        <>
          <div className="share-ui-container">
            <Button onClick={toggleShareHelpOpen} isRounded>
              <Icon><FontAwesomeIcon icon={faShare} /></Icon>
            </Button>
          </div>
          <Modal
            isOpen={isShareHelpOpen}
            onRequestClose={toggleShareHelpOpen}
            contentLabel="Share this document"
          >
            <div className="modal-content-container">
              <div className="modal-content-header">
                <Title isSize="3">
                  <span>Share this document</span>
                  <span>
                    <Button onClick={toggleShareHelpOpen} isRounded>
                      <Icon><FontAwesomeIcon icon={faTimes} /></Icon>
                    </Button>
                  </span>
                </Title>
              </div>
              <div className="modal-content-body">
                <div>Share the URL address of this document:</div>
                <pre><code>{window.location.href}</code></pre>
                <div>Embed this document in another page or application:</div>
                <pre><code>{`<iframe src="${window.location.href}"></iframe>`}</code></pre>
              </div>
            </div>
          </Modal>
        </>
      }
    </div>
  );
};

export default enhancer(props => {
  if (props.slideshow) {
    return (<Player {...props} local />);
  }
  return <Loader />;
});
