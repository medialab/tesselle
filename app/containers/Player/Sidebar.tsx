import React, { useCallback } from 'react';
import {Link} from 'react-router-dom';
import { withLeaflet } from 'react-leaflet';
import Annotation from 'types/Annotation';
import cx from 'classnames';
import {
  Box,
  StretchedLayoutItem,
  StretchedLayoutContainer,
  Content,
  Button,
  Icon,
  Title,
 } from 'quinoa-design-library';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import { annotationToBounds } from 'utils/geo';
import 'components/Sidebar/styles.css';
import { changeSelection, SureContextProps } from 'types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';

const Header: React.SFC<{
  onButtonClick: () => void;
  title: string;
  minified: boolean;
}> = props => (
  <div className="sidebar--header-container sidebar--spacing">
    <Title isSize={5}>{props.title}</Title>
    <Button isRounded onClick={props.onButtonClick} style={{ marginBottom: '.5rem', marginRight: '.8rem' }}>
      <Icon>
        {
          props.minified ?
          <FontAwesomeIcon icon={faTimes} />
          :
          <FontAwesomeIcon icon={faPlay} />
        }
      </Icon>
    </Button>
  </div>
);

interface MenuItemProps {
  children: React.ReactChild;
  selected: boolean;
  annotation: Annotation<any, any>;
  onGoTo: (annotation: Annotation) => void;
  onClick: changeSelection;
}

const MenuItem: React.SFC<MenuItemProps> = props => {
  const onGoTo = useCallback((e) => {
    if (props.selected) {
      e.stopPropagation();
    }
    props.onGoTo(props.annotation);
  }, [props.annotation]);
  const onClick = useCallback(() => props.onClick(props.annotation), [props.annotation]);
  const isInvisible = props.annotation.geometry.type === 'LineString';
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
      'sidebar--menu-item__invisible': isInvisible,
    })}>
      <Box onClick={onClick}>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem style={{ paddingRight: '1rem' }} isFlex={1}>
            <Content className={cx('sidebar--item-field', {
              'sidebar--item-field--selected': props.selected,
            })}>
              {props.children}
            </Content>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <StretchedLayoutContainer isDirection="horizontal">
              <div>
                {!isInvisible && <Button isRounded onClick={onGoTo} style={{ margin: '.3rem' }}>
                  <Icon><FontAwesomeIcon icon={faEye} /></Icon>
                </Button>}
              </div>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Box>
    </div>
  );
};

const Control: React.SFC<{
  selected: Annotation;
  onPrev?: () => void;
  onNext?: () => void;
}> = props => (
  <div className={cx({
    'sidebar--menu-item sidebar--spacing': true,
    'sidebar--menu-item__selected': props.selected,
    'sidebar--menu-item__minified': true,
  })}>
    <>
      <StretchedLayoutContainer isDirection="horizontal" className="utils__space-between">
        <StretchedLayoutItem>
          <Button
            disabled={!props.onPrev}
            isRounded onClick={props.onPrev}
            style={{ margin: '.3rem', marginRight: '1rem' }}>
            <Icon>
              <FontAwesomeIcon icon={faCaretLeft} />
            </Icon>
          </Button>
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={1}>
          <Content className={cx('sidebar--item-field', {
            'sidebar--item-field--selected': props.selected,
            'sidebar--item-field--minified': true,

          })}>
            {props.children}
          </Content>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <Button
            disabled={!props.onNext}
            isRounded onClick={props.onNext}
            style={{ margin: '.3rem', marginLeft: '1rem' }}>
            <Icon>
              <FontAwesomeIcon icon={faCaretRight} />
            </Icon>
          </Button>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </>
  </div>
);

interface SidebarProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: List<Annotation>;
  readonly changeSelection: changeSelection;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
  readonly viewerMode?: boolean;
}

const Sidebar = withLeaflet<SidebarProps & SureContextProps>((props) => {
  const selected = props.selectedAnnotations.first() as Annotation;
  const onClickToggle = React.useCallback(() => {
    props.visible ? props.onClose() : props.onOpen();
    if (!selected) {
      props.changeSelection(props.slideshow.annotations.first());
    }
  }, [props.visible, props.slideshow.annotations]);
  const onGoTo = useCallback((annotation) => {
    props.leaflet.map.fitBounds(annotationToBounds(annotation), { animate: true });
  }, [props.leaflet && props.leaflet.map]);
  return (
    <div className={cx({
      'sidebar': true,
      'player-sidebar': true,
      'visible': props.visible,
      'hidden': !props.visible,
      })}>
      <StretchedLayoutContainer style={{height: '100%'}}>
        <StretchedLayoutItem>
          <Header minified={!props.visible} title={props.slideshow.name} onButtonClick={onClickToggle} />
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={1} style={{overflow: 'hidden'}}>
          <div className="sidebar--container play-sidebar--container">
              {props.visible ?
                props.slideshow.annotations.map((annotation: Annotation) =>
                  <MenuItem
                    onGoTo={onGoTo}
                    onClick={props.changeSelection}
                    annotation={annotation}
                    key={annotation.properties.id}
                    selected={props.selectedAnnotations.includes(annotation)}>{annotation.properties.content}
                  </MenuItem>,
                )
                : <Control
                    selected={selected}
                    onNext={props.onNext}
                    onPrev={props.onPrev}>{selected.properties.content}</Control>}
            </div>
        </StretchedLayoutItem>
        {
          !props.viewerMode &&
          <StretchedLayoutItem>
            <footer className="sidebar--footer-container sidebar--spacing">
              <StretchedLayoutContainer isDirection="horizontal" style={{width: '100%'}}>
                <StretchedLayoutItem isFlex={1}>
                  <Link
                    to={`/editor/${props.slideshow.id}`}
                    className="button is-fullwidth is-primary"
                  >
                      Back to edition
                  </Link>
                </StretchedLayoutItem>
                <StretchedLayoutItem isFlex={1}>
                  <StretchedLayoutContainer isDirection="horizontal">
                    <StretchedLayoutItem isFlex={1}>
                      <Button
                        isFullWidth
                        isColor="info"
                        disabled={!props.slideshow.annotations.size}
                      >
                        Download ↓
                      </Button>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Button isColor="info">?</Button>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </footer>
          </StretchedLayoutItem>
        }

      </StretchedLayoutContainer>
    </div>
  );
});

export default Sidebar;
