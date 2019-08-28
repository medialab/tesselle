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

interface FetchResponse {
  slideshow: Slideshow;
  status: string;
}
function Viewer(props) {
  const params = new URLSearchParams(props.location.search);
  const base = normalize(window.location.protocol + params.get('url') as string);
  const response = useFetchJson<FetchResponse>(
    `${params.get('url')}/slideshow.json`,
    response => {
      console.log('response', response);
      if (response.status === 'success') {
        return {slideshow: new Slideshow(response.data), status: 'success'};
      } else {
        console.error('oups');
        return { status: 'error' };
      }
    },
  );
  let slideshow;
  let status;
  if (response) {
    slideshow = response.slideshow;
    status = response.status;
  }
  const [selected, setSelected] = useState<List<Annotation>>(List([]));
  const onChangeSelection = useCallback((annotation: Annotation) => {
    const newSelection = annotation ? List([annotation]) : List([]);
    if (!newSelection.equals(selected)) {
      return setSelected(newSelection);
    }
  }, [selected]);
  if (status === 'error') {
    return <Viewer404 URL={base} />;
  } else if (slideshow) {
    return (
      <Player
        url={`${base}/info.json`}
        slideshow={slideshow}
        selectedAnnotations={selected}
        changeSelection={onChangeSelection}
        viewerMode
      />
    );
  } else {
    return <Loader />;
  }
}

export default Viewer;
