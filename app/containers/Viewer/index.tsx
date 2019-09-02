/**
 *
 * Viewer
 *
 */

import React, { useState, useCallback } from 'react';
import Slideshow from 'types/Slideshow';
import { Player } from 'containers/Player';
import Loader from 'components/Loader';
import Viewer404 from 'components/Viewer404';
import { List } from 'immutable';
import Annotation from 'types/Annotation';
import normalize from 'normalize-url';
import { useFetchJson } from 'utils/hooks';

function Viewer(props) {
  const params = new URLSearchParams(props.location.search);
  const base = normalize(window.location.protocol + params.get('url') as string);
  const response = useFetchJson<Slideshow>(`${params.get('url')}/slideshow.json`);
  const [selected, setSelected] = useState<List<Annotation>>(List([]));
  const onChangeSelection = useCallback((annotation: Annotation) => {
    const newSelection = annotation ? List([annotation]) : List([]);
    if (!newSelection.equals(selected)) {
      return setSelected(newSelection);
    }
  }, [selected]);
  if (response) {
    if (response.status === 'error') {
      return <Viewer404 URL={base} />;
    }
    return (
      <Player
        url={`${base}/info.json`}
        slideshow={new Slideshow(response.data)}
        selectedAnnotations={selected}
        changeSelection={onChangeSelection}
        viewerMode
      />
    );
  }
  return <Loader />;
}

export default Viewer;
