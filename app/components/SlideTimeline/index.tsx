/**
 *
 * SlideTimeline
 *
 */

import * as React from 'react';
import Slide from 'types/Slide';
import { Button } from 'quinoa-design-library';
import './styles.css';

// import styled from 'styles/styled-components';

interface OwnProps {
  slide: Slide;
  onRemove: (event: Slide) => void;
}

const SlideTimeline: React.SFC<OwnProps> = (props: OwnProps) => {
  const onButtonClick = React.useCallback(() => props.onRemove(props.slide), [props.slide]);
  return (
    <div className="timeline__slide-container">
      <Button className="timeline__slide-remove-buttom" isRounded isColor="error" onClick={onButtonClick}>x</Button>
      <div>
        <img src={window.URL.createObjectURL(props.slide.file)} />
      </div>
    </div>
  );
};

export default SlideTimeline;
