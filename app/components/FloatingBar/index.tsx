/**
 *
 * FloatingBar
 *
 */

import * as React from 'react';
import Control from 'react-leaflet-control';
import { Button, Icon } from 'quinoa-design-library';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { SupportedShapes } from 'types';
import './styles.css';

interface OwnProps {
  onRectangleClick: (event: any) => any;
  onCircleClick: (event: any) => any;
  activeButton: SupportedShapes;
}

const FloatingBar: React.SFC<OwnProps> = (props: OwnProps) => {

  const buttons = [{
    icon: icons.anchorRectangle,
    tool: SupportedShapes.rectangle,
    event: props.onRectangleClick,
  }, {
    icon: icons.anchorEllipse,
    tool: SupportedShapes.circle,
    event: props.onCircleClick,
  }];

  return (
    <Control position="bottomright">
      <div className="buttons-container">
        {buttons
          .map(({icon, tool, event}) => (
            <Button
              onClick={event}
              key={tool}
              isColor={tool === props.activeButton ? 'primary' : ''}
              style={{marginBottom: '.5rem'}} isRounded>
              <Icon isSize="medium" isAlign="left">
                <img src={icon[tool === props.activeButton ? 'white' : 'black'].svg} />
              </Icon>
            </Button>
        ))}
      </div>
    </Control>
  );
};

export default FloatingBar;
