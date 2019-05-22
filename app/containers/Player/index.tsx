/**
 *
 * Player
 *
 */

import React, { useState, useEffect } from 'react';
import { Map, withLeaflet, ZoomControl } from 'react-leaflet';
import useMousetrap from 'react-hook-mousetrap';


import L from 'leaflet';
import AnnotationLayer from 'components/AnnotationLayer';
import IiifLayer from 'components/IiifLayer';
import { useLockEffect } from 'utils/hooks';
import Annotation from 'types/Annotation';
import { enhancer, EditorProps } from 'containers/Editor';
import { List } from 'immutable';

const minZoom = 1;
const maxZoom = 20;

const PlayerMap = withLeaflet((props: Pick<EditorProps, any>) => {
  const [selected, setSelected] = useState<Annotation>();
  useMousetrap('k', () => {
    if (selected) {
      const index = props.slideshow.annotations.indexOf(selected);
      if (index + 1 < props.slideshow.annotations.size) {
        setSelected(props.slideshow.annotations.get(index + 1));
      } else {
        setSelected(props.slideshow.annotations.first());
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
      } else {
        setSelected(props.slideshow.annotations.last());
      }
    } else {
      setSelected(props.slideshow.annotations.last());
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
    <div className="map">
      <Map
        boxZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        crs={L.CRS.Simple}
        center={[0, 0]}
        minZoom={minZoom}
        maxZoom={maxZoom}>
          <ZoomControl position="topright" />
          <PlayerMap slideshow={props.slideshow} />
      </Map>
    </div>
  );
}

export default enhancer(props => {
  useEffect(() => {
    console.log('Editor component did mount');
    return () => {
      console.log('Editor component will unmount');
    };
  }, []);
  if (props.slideshow) {
    return (
      <Player {...props} />
    );
  }
  return <div />;
});
