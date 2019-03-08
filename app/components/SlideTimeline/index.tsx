/**
 *
 * SlideTimeline
 *
 */

import * as React from 'react';
import Slide from 'types/Slide';
import { Button } from 'quinoa-design-library';
import cx from 'classnames';
import './styles.css';

// import styled from 'styles/styled-components';

interface OwnProps {
  slide: Slide;
  onRemove: (event: Slide) => void;
  onClick: (slide: Slide) => any;
  selected: boolean;
}

const SlideTimeline: React.SFC<OwnProps> = (props: OwnProps) => {
  const onButtonClick = React.useCallback(() => props.onRemove(props.slide), [props.slide]);
  const onAllClick = React.useCallback(() => props.onClick(props.slide), [props.slide]);
  return (
    <div
      onClick={onAllClick}
      className={cx('timeline__slide-container', props.selected && 'timeline__slide-container--selected')}>
      <Button className="timeline__slide-remove-buttom" isRounded isColor="error" onClick={onButtonClick}>x</Button>
      <div>
        <img src={window.URL.createObjectURL(props.slide.file)} />
      </div>
    </div>
  );
};

export default SlideTimeline;
