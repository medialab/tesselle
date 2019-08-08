import { takeLatest, put, select } from 'redux-saga/effects';
import { when } from 'ramda';

import ActionTypes from './constants';
import Slideshow from '../../types/Slideshow';
import db from 'utils/db';
import { makeSelectSlideshow } from './selectors';
import { isImmutable } from 'immutable';
import { RouteComponentProps } from 'react-router';
import { editSlideshowAction } from './actions';

const selectSlideshow = makeSelectSlideshow();

export function* setSlideshow(slideshow: Slideshow) {
  yield put(
    editSlideshowAction(slideshow),
  );
}

export function* saveSlideshow(action) {
  const slideshow: Slideshow = yield select(selectSlideshow);
  if (isImmutable(slideshow)) {
    const slideshows = yield db.getItem('slideshows');
    yield db.setItem('slideshows', slideshows.map(
      when(
        raw => raw.id === slideshow.id,
        _ => slideshow.toJS(),
      ),
    ));
  }
}

// Individual exports for testing
export default function* editorSaga(props: RouteComponentProps<{id: string}>) {
  const slideshowId = props.match.params.id;
  yield takeLatest(ActionTypes.CREATE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.REMOVE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.EDIT_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.CHANGE_ORDER, saveSlideshow);
  yield takeLatest(ActionTypes.EDIT_SLIDESHOW, saveSlideshow);
  try {
    const immutableSlideshow = yield select(selectSlideshow);
    if (immutableSlideshow && immutableSlideshow.id === slideshowId) {
      return;
    }
    const slideshows = yield db.getItem('slideshows');
    const rawSlideshow: Slideshow = slideshows.find(({id}) => id === slideshowId);
    if (rawSlideshow) {
      yield setSlideshow(rawSlideshow);
    }
  } catch (e) {
    console.error(e);
  }
}
