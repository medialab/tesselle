import { takeLatest, put } from 'redux-saga/effects';
import ActionTypes from './constants';
import Slideshow, { slideshowCreator } from '../../types/Slideshow';
import { createSlideshowAction } from './actions';
import { push } from 'react-router-redux';
import db from '../../utils/db';

// const slideshowFromAction = (action) => slideshowCreator(action.payload);

export function* setSlideshow(slideshow: Slideshow) {
  yield db.setItem('slideshow', slideshow);
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

function* isThereSomethingInMemory() {
  try {
    const rawSlideshow = yield db.getItem('slideshow');
    yield setSlideshow(rawSlideshow as Slideshow);
    // yield setSlideshow(Slideshow.from(rawSlideshow));
  } catch (e) {
    console.error(e);
    console.log('koiiii');
  }
}

// Individual exports for testing
export default function* editorSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield isThereSomethingInMemory();
  console.log('Mais il attend ?');
}
