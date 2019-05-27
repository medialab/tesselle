/**
 *
 * Player
 *
 */

import React, { useCallback, useRef, useState } from 'react';
import { Map, withLeaflet, ZoomControl, ContextProps } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';

import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import IiifLayer from 'components/IiifLayer';
import { useLockEffect, useToggleBoolean } from 'utils/hooks';
import Annotation from 'types/Annotation';
import { enhancer, EditorProps, changeSelection } from 'containers/Editor';
import 'components/Sidebar/styles.css';
import cx from 'classnames';
import { Box, StretchedLayoutItem, StretchedLayoutContainer } from 'quinoa-design-library';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import { annotationToBounds } from 'utils/geo';
import ReactDOM from 'react-dom';

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

interface MenuItemProps {
  children: React.ReactChild;
  selected: boolean;
  annotation: Annotation;
  onGoTo: (annotation: Annotation) => void;
  onClick: changeSelection;
}

const MenuItem: React.SFC<MenuItemProps> = props => {
  const onGoTo = useCallback(() => {
    props.onGoTo(props.annotation);
  }, [props.annotation]);
  const onClick = useCallback(() =>
    props.onClick(props.annotation)
  , [props.annotation]);
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
    })}>
      <Box onClick={onClick}>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem style={{paddingRight: '1rem'}} isFlex={1}>
            <h1
              className={cx('sidebar--item-field', props.selected && 'sidebar--item-field--selected')}
            >{props.children}</h1>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
              <StretchedLayoutContainer isDirection="horizontal">
                <div>
                  <div
                    onClick={onGoTo}
                    className="button is-lock-status-open"
                    style={{marginBottom: '.5rem'}}>
                    Goto
                  </div>
                </div>
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Box>
    </div>
  );
};

const Play = props => <div onClick={props.onPlay}>Play ></div>;

const Control: React.SFC<{
  selected: Annotation;
  onPrev: () => void;
  onNext: () => void;
}> = props => {
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
    })}>
      <Box>
        <StretchedLayoutContainer isDirection="horizontal" className="utils__space-between">
          <StretchedLayoutItem>
            <div
              onClick={props.onPrev}
              className="button is-lock-status-open"
              style={{marginBottom: '.5rem'}}>
              Prev
            </div>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <h1
              className={cx('sidebar--item-field', props.selected && 'sidebar--item-field--selected')}
            >{props.children}</h1>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <div
              onClick={props.onNext}
              className="button is-lock-status-open"
              style={{marginBottom: '.5rem'}}>
              Next
            </div>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Box>
    </div>
  );
};

interface SidebarProps extends ContextProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: List<Annotation>;
  readonly changeSelection: changeSelection;
}

const Sidebar = withLeaflet<SidebarProps>((props) => {
  const selected = props.selectedAnnotations.first() as Annotation;

  const onClickToggle = React.useCallback(() => {
    props.visible ? props.onClose() : props.onOpen();
    if (!selected) {
      props.changeSelection(props.slideshow.annotations.first());
    }
  },
    [props.visible, props.slideshow.annotations],
  );

  const onGoTo = useCallback((annotation) => {
    if (props.leaflet && props.leaflet.map) {
      props.leaflet.map.fitBounds(
        annotationToBounds(annotation),
        {animate: true},
      );
    }
  }, [props.leaflet && props.leaflet.map]);

  const onNext = useCallback(
    () => props.changeSelection(selectNext(selected, props.slideshow.annotations)),
    [selected, props.slideshow.annotations],
  );

  const onPrev = useCallback(
    () => props.changeSelection(selectNext(selected, props.slideshow.annotations.reverse())),
    [selected, props.slideshow.annotations],
  );

  return (
    <div className={cx({sidebar: true, visible: props.visible, hidden: !props.visible})}>
      <div className="sidebar--header-container sidebar--spacing">
        <Play onPlay={onClickToggle} />
      </div>
      <div className="sidebar--container">
        {props.visible ?
          props.slideshow.annotations.map((annotation: Annotation) =>
            <MenuItem
              onGoTo={onGoTo}
              onClick={props.changeSelection}
              annotation={annotation}
              key={annotation.properties.id}
              selected={props.selectedAnnotations.includes(annotation)}
            >{annotation.properties.content}</MenuItem>,
          )
          : <Control selected={selected} onNext={onNext} onPrev={onPrev}>{selected.properties.content}</Control>
        }
      </div>
    </div>
  );
});

const selectNext = (selected, annotations) => {
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

const SidebarContainer = React.forwardRef((props, ref) => <div ref={ref as any} />);

function Player(props) {
  const [mountSidebar, setMountSidebar] = useState<boolean>(false);
  const [sidebarVisible, onClose, onOpen] = useToggleBoolean();
  const selected = props.selectedAnnotations.first();
  useMousetrap('k', () => {
    props.changeSelection(selectNext(selected, props.slideshow.annotations));
  });
  useMousetrap('j', () => {
    props.changeSelection(selectNext(selected, props.slideshow.annotations.reverse()));
  });
  const onMapClick = useCallback((event) => {
    if (event.originalEvent.originalTarget.classList.contains('leaflet-container') && !sidebarVisible) {
      props.changeSelection();
    }
  }, []);
  const sidebarRef = useRef<Element | null>(null);
  const sidebarReady = (domElement) => {
    sidebarRef.current = domElement;
    setMountSidebar(true);
  };

  return (
    <div className="map">
      <SidebarContainer ref={sidebarReady} />
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
