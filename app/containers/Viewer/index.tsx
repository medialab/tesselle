/**
 *
 * Viewer
 *
 */

import React, { useState, useCallback } from 'react';
import Slideshow from 'types/Slideshow';
import { Player } from 'containers/Player';
import { List } from 'immutable';
import Annotation from 'types/Annotation';
import normalize from 'normalize-url';
import { useFetchJson } from 'utils/hooks';

function Viewer(props) {
  const params = new URLSearchParams(props.location.search);
  const base = normalize(window.location.protocol + params.get('url') as string);
  const slideshow = useFetchJson<Slideshow>(
    `${params.get('url')}/slideshow.json`,
    rawSlideshow => new Slideshow(rawSlideshow),
  );
  const [selected, setSelected] = useState<List<Annotation>>(List([]));
  const onChangeSelection = useCallback((annotation: Annotation) => {
    const newSelection = annotation ? List([annotation]) : List([]);
    if (!newSelection.equals(selected)) {
      return setSelected(newSelection);
    }
  }, [selected]);
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

export default Viewer;
