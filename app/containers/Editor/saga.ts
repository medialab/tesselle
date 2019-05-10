import { takeLatest, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import ActionTypes from './constants';
import Slideshow from '../../types/Slideshow';
import db from 'utils/db';
import { makeSelectSlideshow } from './selectors';
import { isImmutable } from 'immutable';

const selectSlideshow = makeSelectSlideshow();

export function* setSlideshow(slideshow: Slideshow) {
  if (isImmutable(slideshow)) {
    yield db.setItem('slideshow', slideshow.toJS());
  }
  // yield put(
  //   createSlideshowAction.success(
  //     slideshow,
  //   ),
  // );
}

export function* saveSlideshow() {
  const slideshow: Slideshow = yield select(selectSlideshow);
  if (isImmutable(slideshow)) {
    yield db.setItem('slideshow', slideshow.toJS());
  }
}

// Individual exports for testing
export default function* editorSaga() {
  yield takeLatest(ActionTypes.CREATE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.REMOVE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.EDIT_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.CHANGE_ORDER, saveSlideshow);
  yield takeLatest(ActionTypes.EDIT_SLIDESHOW, saveSlideshow);
  try {
    const rawSlideshow: Slideshow = yield db.getItem('slideshow');
    if (rawSlideshow) {
      yield setSlideshow(rawSlideshow);
    } else {
      yield put(push('/'));
    }
  } catch (e) {
    console.error(e);
  }
}
