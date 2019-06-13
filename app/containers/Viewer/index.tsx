/**
 *
 * Viewer
 *
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Slideshow from 'types/Slideshow';
import { Player } from 'containers/Player';
import { List } from 'immutable';
import Annotation from 'types/Annotation';
import normalize from 'normalize-url';

function Viewer(props) {
  const params = new URLSearchParams(props.location.search);
  const base = normalize(params.get('url') as string);
  console.log(base, params.get('url'));
  const [slideshow, setSlideshow] = useState<Slideshow>();
  useEffect(() => {
    window.fetch(`${params.get('url')}/slideshow.json`)
    .then(res => res.json())
    .then((rawSlideshow) => setSlideshow(new Slideshow(rawSlideshow)));
  }, []);
  const [selected, setSelected] = useState<List<Annotation>>(List([]));
  const onChangeSelection = useCallback((annotation: Annotation) => setSelected(List([annotation])), []);
  if (slideshow) {
    return (
      <Player
        url={`${base}/info.json`}
        slideshow={slideshow}
        selectedAnnotations={selected}
        changeSelection={onChangeSelection}
      />
    );
  } else {
    return <div>Loading</div>;
  }
}

Viewer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default Viewer;
