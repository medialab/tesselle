/**
 *
 * FloatingBar
 *
 */

import * as React from 'react';
import Control from 'react-leaflet-control';
import { Button, Icon } from 'quinoa-design-library';
import Tooltip from 'react-tooltip';
import icons from '../../images/icons/';
import { SupportedShapes } from 'types';
import './styles.css';

interface FloatingBarProps {
  onRectangleClick: (event: any) => any;
  onCircleClick: (event: any) => any;
  onSelectClick: (event: any) => any;
  onPolygonClick: (event: any) => any;
  onInvisibleClick: (event: any) => any;
  activeButton: SupportedShapes;
}

const FloatingBar: React.SFC<FloatingBarProps> = (props: FloatingBarProps) => {
  const buttons = [{
    icon: icons.select,
    tool: SupportedShapes.selector,
    event: props.onSelectClick,
    helpMessage: 'select (shortcut: escape)',
  }, {
    icon: icons.anchorRectangle,
    tool: SupportedShapes.rectangle,
    event: props.onRectangleClick,
    helpMessage: 'rectangle (shortcut: r)',
  }, {
    icon: icons.anchorEllipse,
    tool: SupportedShapes.circle,
    event: props.onCircleClick,
    helpMessage: 'circle (shortcut: c)',
  }, {
    icon: icons.anchorPolygon,
    tool: SupportedShapes.polygon,
    event: props.onPolygonClick,
    helpMessage: 'polygon (shortcut: p)',
  }];

  return (
    <Control position="bottomright">
      <div className="buttons-container">
        {buttons.map(({icon, tool, event, helpMessage}) => (
            <Button
              onClick={event}
              key={tool}
              data-tip={helpMessage}
              data-for="tool-tooltip"
              isColor={tool === props.activeButton ? 'primary' : ''}
              style={{marginBottom: '.5rem'}} isRounded>
              <Icon isSize="medium" isAlign="left">
                <img src={icon[tool === props.activeButton ? 'white' : 'black']} />
              </Icon>
            </Button>
        ))}
      </div>
      <Tooltip id="tool-tooltip" place="left" effect="solid" />
    </Control>
  );
};

export default FloatingBar;
