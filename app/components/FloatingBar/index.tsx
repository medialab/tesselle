/**
 *
 * FloatingBar
 *
 */

import * as React from 'react';
import Control from 'react-leaflet-control';
import { Button } from 'quinoa-design-library';

interface OwnProps {
  onRectangleClick: (event: any) => any;
}

const FloatingBar: React.SFC<OwnProps> = (props: OwnProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onMainButtonClick = React.useCallback(() => {
    setIsOpen((state) => !state);
  }, []);
  const makeLogger = (message: string) => () => console.log(message);
  return (
    <Control position="topleft">
      <Button isColor={isOpen && 'warning'} onClick={onMainButtonClick}>+</Button>
      {isOpen && (
        <>
          <Button onClick={makeLogger('onClickAnnotation')}>.</Button>
          <Button onClick={makeLogger('onClickCircle')}>O</Button>
          <Button onClick={props.onRectangleClick}>[]</Button>
        </>
      )}
    </Control>
  );
};

export default FloatingBar;
