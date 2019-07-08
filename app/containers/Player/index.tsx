/**
 *
 * Player
 *
 */

import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Map, withLeaflet, ZoomControl, ImageOverlay } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';
import { Button, Icon, Title } from 'quinoa-design-library';
import { useFullScreen } from 'react-browser-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand';
import Tooltip from 'react-tooltip';
import Modal from 'react-modal';

import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import Loader from 'components/Loader';
import { LocalIiifLayer, DistantIiifLayer } from 'components/IiifLayer';
import { useLockEffect, useToggleBoolean, useUrl, coverToBounds } from 'utils/hooks';
import { enhancer } from 'containers/Editor';
import ReactDOM from 'react-dom';
import Sidebar from './Sidebar';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import Annotation from 'types/Annotation';
import { SureContextProps, changeSelection } from 'types';

import './style.css';
import { isSvg } from 'utils/index';

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
  const selected = props.selectedAnnotations.first<any>();
  const isInvisible = selected && selected.geometry.type === 'LineString';
  useLockEffect(props.leaflet.map, (selected && props.playing) ? selected : props.slideshow.image, isInvisible);
  let child;
  if (props.url) {
    if (isSvg(props.slideshow.image)) {
      child = (
        <ImageOverlay
          url={`${props.url}/../thumbnail.svg`}
          bounds={useMemo(() => coverToBounds(props.slideshow.image), [props.slideshow.image])} />
      );
    } else {
      child = <DistantIiifLayer url={props.url} />;
    }
  } else if (isSvg(props.slideshow.image)) {
    child = (
      <ImageOverlay
        url={useUrl(props.slideshow.image.file)}
        bounds={useMemo(() => coverToBounds(props.slideshow.image), [props.slideshow.image])}
      />
    );
  } else {
    child = <LocalIiifLayer tileSize={512} id={props.slideshow.image.id} />;
  }
  return (
    <React.Fragment>
      <AnnotationLayer
        onLayerClick={props.playing ? undefined : props.changeSelection}
        data={props.slideshow.annotations}
        selectedAnnotations={props.selectedAnnotations} />
      {child}
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

const noop = undefined;
export const Player: React.SFC<PlayerContainerProps> = (props) => {
  const selected = props.selectedAnnotations.first();
  const [mountSidebar, setMountSidebar] = useState<boolean>(false);
  const [isShareHelpOpen, setShareHelpOpen] = useState<boolean>(false);
  const [sidebarVisible, onClose, onOpen] = useToggleBoolean();
  const fs = useFullScreen();
  const onPlay = useCallback(() => {
    onOpen();
    if (!selected) {
      onNext();
    }
  }, [onOpen]);
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
      <div className="player-actions-container">
        {
          props.viewerMode &&
          <Button data-for="tooltip" data-tip="share this view" onClick={toggleShareHelpOpen} isRounded>
            <Icon><FontAwesomeIcon icon={faShare} /></Icon>
          </Button>
        }
        <Button data-for="tooltip" data-tip="fullscreen mode" onClick={fs.toggle} isRounded>
            <Icon><FontAwesomeIcon icon={faExpand} /></Icon>
        </Button>
      </div>
      {
        props.viewerMode &&
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
      }
      <Tooltip id="tooltip" place="left" effect="solid" />
    </div>
  );
};

export default enhancer(props => {
  if (props.slideshow) {
    return (<Player {...props} local />);
  }
  return <Loader />;
});
