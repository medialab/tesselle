import { takeLatest, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import ActionTypes from './constants';
import Slideshow, { slideshowCreator } from '../../types/Slideshow';
import { createSlideshowAction } from './actions';
import db from '../../utils/db';
import { makeSelectSlideshow } from './selectors';

const selectSlideshow = makeSelectSlideshow();

export function* setSlideshow(slideshow: Slideshow) {
  if (slideshow.toJS) {
    yield db.setItem('slideshow', slideshow.toJS());
  }
  yield put(
    createSlideshowAction.success(
      slideshow,
    ),
  );
}

export function* createSlideshow(action: any) {
  try {
    const slideshow: Slideshow = yield slideshowCreator(action.payload);
    yield setSlideshow(slideshow);
    return slideshow;
  } catch (e) {
    console.info('This should not happend');
    console.error(e);
  }
}

export function* createAndRedirect(action) {
  yield createSlideshow(action);
  yield put(push('/editor'));
}

export function* saveSlideshow() {
  const slideshow: Slideshow = yield select(selectSlideshow);
  if (slideshow.toJS) {
    yield db.setItem('slideshow', slideshow.toJS());
  }
}

// Individual exports for testing
export default function* editorSaga() {
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield takeLatest(ActionTypes.CREATE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.REMOVE_ANNOTATION, saveSlideshow);
  yield takeLatest(ActionTypes.EDIT_ANNOTATION,   saveSlideshow);
  yield takeLatest(ActionTypes.CHANGE_ORDER,      saveSlideshow);
  try {
    const rawSlideshow: Slideshow = yield db.getItem('slideshow');
    // const slideshow = Slideshow.builder(rawSlideshow).build();
    if (rawSlideshow) {
      yield setSlideshow(rawSlideshow);
    } else {
      yield put(push('/'));
    }
  } catch (e) {
    console.error(e);
  }
}
