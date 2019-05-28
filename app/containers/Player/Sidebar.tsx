import React, { useCallback } from 'react';
import { withLeaflet } from 'react-leaflet';
import Annotation from 'types/Annotation';
import cx from 'classnames';
import { Box, StretchedLayoutItem, StretchedLayoutContainer, Button } from 'quinoa-design-library';
import Slideshow from 'types/Slideshow';
import { List } from 'immutable';
import { annotationToBounds } from 'utils/geo';
import 'components/Sidebar/styles.css';
import { changeSelection, SureContextProps } from 'types';

const Header: React.SFC<{
  onButtonClick: () => void;
}> = props => (
  <div className="sidebar--header-container sidebar--spacing">
    <div onClick={props.onButtonClick}>Play ></div>
  </div>
);

interface MenuItemProps {
  children: React.ReactChild;
  selected: boolean;
  annotation: Annotation;
  onGoTo: (annotation: Annotation) => void;
  onClick: changeSelection;
}

const MenuItem: React.SFC<MenuItemProps> = props => {
  const onGoTo = useCallback(() => props.onGoTo(props.annotation), [props.annotation]);
  const onClick = useCallback(() => props.onClick(props.annotation), [props.annotation]);
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
    })}>
      <Box onClick={onClick}>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem style={{ paddingRight: '1rem' }} isFlex={1}>
            <h1 className={cx('sidebar--item-field', props.selected && 'sidebar--item-field--selected')}>
              {props.children}
            </h1>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <StretchedLayoutContainer isDirection="horizontal">
              <div>
                <Button onClick={onGoTo} style={{ marginBottom: '.5rem' }}>
                  Goto
                </Button>
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
  onPrev: () => void;
  onNext: () => void;
}> = props => (
  <div className={cx({
    'sidebar--menu-item sidebar--spacing': true,
    'sidebar--menu-item__selected': props.selected,
  })}>
    <Box>
      <StretchedLayoutContainer isDirection="horizontal" className="utils__space-between">
        <StretchedLayoutItem>
          <Button onClick={props.onPrev} style={{ marginBottom: '.5rem' }}>
            Prev
          </Button>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <h1 className={cx('sidebar--item-field', props.selected && 'sidebar--item-field--selected')}>
            {props.children}
          </h1>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <Button onClick={props.onNext} style={{ marginBottom: '.5rem' }}>
            Next
          </Button>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Box>
  </div>
);

interface SidebarProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly slideshow: Slideshow;
  readonly selectedAnnotations: List<Annotation>;
  readonly changeSelection: changeSelection;
  readonly onPrev: () => void;
  readonly onNext: () => void;
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
    <div className={cx({ sidebar: true, visible: props.visible, hidden: !props.visible })}>
      <Header onButtonClick={onClickToggle} />
      <div className="sidebar--container">
        {props.visible ?
          props.slideshow.annotations.map((annotation: Annotation) =>
            <MenuItem
              onGoTo={onGoTo}
              onClick={props.changeSelection}
              annotation={annotation}
              key={annotation.properties.id}
              selected={props.selectedAnnotations.includes(annotation)}>{annotation.properties.content}</MenuItem>)
          : <Control
              selected={selected}
              onNext={props.onNext}
              onPrev={props.onPrev}>{selected.properties.content}</Control>}
      </div>
    </div>
  );
});

export default Sidebar;
