/**
 *
 * Player
 *
 */

import React, { useState } from 'react';
import { Map, withLeaflet } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';

import cx from 'classnames';

import { StretchedLayoutContainer, StretchedLayoutItem } from 'quinoa-design-library';
import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import IiifLayer from 'components/IiifLayer';
import { SupportedShapes } from 'types';
import { useLockEffect } from 'utils/hooks';
import Annotation from 'types/Annotation';
import { enhancer, EditorProps } from 'containers/Editor';
import { List } from 'immutable';

const minZoom = 1;
const maxZoom = 20;

const PlayerMap = withLeaflet((props: Pick<EditorProps, any>) => {
  const {slideshow} = props;
  console.log(slideshow);
  const [selected, setSelected] = useState<Annotation>();
  useMousetrap('k', () => {
    if (selected) {
      const index = props.slideshow.annotations.indexOf(selected);
      if (index <= props.slideshow.annotations.size) {
        setSelected(props.slideshow.annotations.get(index + 1));
      }
    } else {
      setSelected(props.slideshow.annotations.first());
    }
  });
  useMousetrap('j', () => {
    if (selected) {
      const index = props.slideshow.annotations.indexOf(selected);
      if (index > 0) {
        setSelected(props.slideshow.annotations.get(index - 1));
      }
    } else {
      setSelected(props.slideshow.annotations.first());
    }
  });

  useLockEffect(props.leaflet.map, props.slideshow.image);

  return (
    <React.Fragment>
      <AnnotationLayer
        data={props.slideshow.annotations}
        selectedAnnotations={List(selected ? [selected] : [])} />
      <IiifLayer tileSize={512} id={props.slideshow.id} />
    </React.Fragment>
  );
});

function Player(props) {
  return (
    <div className={cx({
      map: true,
      creating: SupportedShapes.selector,
    })}>
      <Map
        boxZoom={false}
        dragging
        doubleClickZoom={false}
        crs={L.CRS.Simple}
        center={[0, 0]}
        minZoom={minZoom}
        maxZoom={maxZoom}>
        <PlayerMap slideshow={props.slideshow} />
      </Map>
    </div>
  );
}

export default enhancer(props => {
  console.log(props);
  if (props.slideshow) {
    return (
      <StretchedLayoutContainer
        isFullHeight
        isDirection="horizontal">
          <StretchedLayoutItem isFlex={2}>
            <Player {...props} />
          </StretchedLayoutItem>
      </StretchedLayoutContainer>
    );
  }
  return <div />;
});
