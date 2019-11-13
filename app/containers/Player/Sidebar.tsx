import React, { useCallback } from 'react';
import {Link} from 'react-router-dom';
import { withLeaflet } from 'react-leaflet';
import Annotation from 'types/Annotation';
import ReactMarkdown from 'react-markdown';

import cx from 'classnames';
import {
  Box,
  StretchedLayoutItem,
  StretchedLayoutContainer,
  Content,
  Notification,
  Button,
  Icon,
  Title,
 } from 'quinoa-design-library';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import { annotationToBounds } from 'utils/geo';
import 'components/Sidebar/styles.css';
import { changeSelection, SureContextProps, SupportedShapes } from 'types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import Download from 'components/Download';

import DownloadModalHelp from '../../components/DownloadModalHelp';
import { useToggleBoolean } from 'utils/hooks';

import logo from '../../images/logo.svg';
import { useHowToModal } from 'components/HowToModal';

const Header: React.SFC<{
  onButtonClick: () => void;
  title: string;
  minified: boolean;
  viewerMode?: boolean;
  allowPlay?: boolean;
}> = props => (
  <div className="sidebar--header-container sidebar--spacing">
    <Title
      isSize={5}
    >
      {
        props.viewerMode ?
        <a href="https://medialab.github.io/tesselle" target="blank" rel="noopener">
          <img data-tip={'Made with tesselle'} data-for="tooltip" src={logo} style={{maxWidth: '2rem'}} />
        </a>
        :
        <Link to="/">
          <img data-tip={'Back to home'} data-for="tooltip" src={logo} style={{maxWidth: '2rem'}} />
        </Link>
      }

    </Title>
    <Title isSize={6} className="is-stretch player-title">{props.title}</Title>
    {
      !!props.allowPlay &&
      <Button
        isRounded
        onClick={props.onButtonClick}
        style={{  marginRight: '.3rem' }}
        data-tip={props.minified ? 'Exit play mode' : 'Play sequentially'}
        data-for="tooltip"
        className="play-playmode-toggle"
      >
        <Icon>
          {
            props.minified ?
            <FontAwesomeIcon icon={faTimes} />
            :
            <FontAwesomeIcon icon={faPlay} />
          }
        </Icon>
      </Button>
    }
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
  const onClick = useCallback((e) => {
    props.onClick(props.annotation);
  }, [props.annotation]);
  const isInvisible = props.annotation.properties.type === SupportedShapes.invisible;
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
      'sidebar--menu-item__invisible': isInvisible,
    })}>
      <Box className="player-card" onClick={onClick}>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem style={{ paddingRight: '1rem' }} isFlex={1}>
            <Content isSize={'small'} className={cx('sidebar--item-field', {
              'sidebar--item-field--selected': props.selected,
            })}>
              {props.children}
            </Content>
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
      <StretchedLayoutContainer isDirection="vertical" className="utils__space-between">
        <StretchedLayoutItem isFlex={1}>
          <Content isSize={'small'} className={cx('sidebar--item-field', {
            'sidebar--item-field--selected': props.selected,
            'sidebar--item-field--minified': true,
          })}>
            {props.children}
          </Content>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <StretchedLayoutContainer isDirection="horizontal" className="minified-nav-container">
            <StretchedLayoutItem>
              <Button
                disabled={!props.onPrev}
                isRounded onClick={props.onPrev}
                style={{ margin: '.2rem' }}>
                <Icon>
                  <FontAwesomeIcon icon={faCaretLeft} />
                </Icon>
              </Button>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Button
                disabled={!props.onNext}
                isRounded onClick={props.onNext}
                style={{ margin: '.2rem' }}>
                <Icon>
                  <FontAwesomeIcon icon={faCaretRight} />
                </Icon>
              </Button>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
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
  }, [props.visible, props.slideshow.annotations, selected]);
  const onGoTo = useCallback((annotation: Annotation) => {
    if (annotation.properties.type !== SupportedShapes.invisible) {
      props.leaflet.map.fitBounds(
        annotationToBounds(annotation),
        { animate: true },
      );
    }
  }, [props.leaflet.map]);
  const [isDownloadModalHelp, onCloseDownloadModalHelp, onOpenDownloadModalHelp] = useToggleBoolean(false);
  const isEmpty = !props.slideshow.annotations.size;
  const [modalButton] = useHowToModal();

  return (
    <div className={cx({
      'sidebar': true,
      'player-sidebar': true,
      'visible': props.visible,
      'hidden': !props.visible,
      'has-selected': props.selectedAnnotations.size > 0,
      'empty': isEmpty,
      'viewer-mode': props.viewerMode,
      })}>
      <StretchedLayoutContainer style={{height: '100%', flex: 1}}>
        <StretchedLayoutItem>
          <Header
            minified={!props.visible}
            title={props.slideshow.name}
            onButtonClick={onClickToggle}
            viewerMode={props.viewerMode}
            allowPlay={!!props.slideshow.annotations.size}
          />
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={1} style={{overflow: 'hidden'}}>
          <div className="sidebar--wrapper play-sidebar--container">
              {props.visible ?
                <>
                  {
                    isEmpty && !props.viewerMode ?
                    <Notification isColor="warning">
                      No annotations yet.
                      <br/>
                      {`You can download this image as a simple viewer or add annotations in `}
                      <Link to={`/editor/${props.slideshow.id}`}>edition mode</Link>.
                    </Notification>
                    :
                    props.slideshow.annotations.map((annotation: Annotation) =>
                      <MenuItem
                        onGoTo={onGoTo}
                        onClick={props.changeSelection}
                        annotation={annotation}
                        key={annotation.properties.id}
                        selected={props.selectedAnnotations.includes(annotation)}>
                          <ReactMarkdown source={annotation.properties.content} />
                      </MenuItem>,
                  )
                  }
                </>
                : <Control
                    selected={selected}
                    onNext={props.onNext}
                    onPrev={props.onPrev}>
                      <ReactMarkdown source={selected.properties.content} />
                    </Control>
                }
            </div>
        </StretchedLayoutItem>
        {
          !props.viewerMode &&
          <StretchedLayoutItem>
            <footer className="sidebar--footer-container sidebar--spacing">
            <StretchedLayoutContainer
              isDirection="horizontal"
              style={{width: '100%'}}
              className="player-footer-container"
            >
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
                      <Download />
                    </StretchedLayoutItem>

                    <StretchedLayoutItem isFlex={1}>
                      {modalButton}
                    </StretchedLayoutItem>

                    <StretchedLayoutItem isFlex={1}>
                      <Button
                        data-for="tooltip"
                        data-tip="Learn how to publish your image online"
                        onClick={onOpenDownloadModalHelp}
                        isColor="warning"
                        isFullWidth
                      >Publish</Button>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </footer>
          </StretchedLayoutItem>
        }

      </StretchedLayoutContainer>
      <DownloadModalHelp isOpen={isDownloadModalHelp} onRequestClose={onCloseDownloadModalHelp} />
    </div>
  );
});

export default Sidebar;
