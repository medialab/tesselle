import { takeLatest, put } from 'redux-saga/effects';
import ActionTypes from './constants';
import Slideshow, { slideshowCreator } from '../../types/Slideshow';
import { createSlideshowAction } from './actions';
import { push } from 'react-router-redux';
import db from '../../utils/db';

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

// const saveFile = (file: File): void => {
//   const svgUrl = URL.createObjectURL(file);
//   const downloadLink = document.createElement('a');
//   downloadLink.href = svgUrl;
//   downloadLink.download = 'newesttree.svg';
//   document.body.appendChild(downloadLink);
//   downloadLink.click();
//   document.body.removeChild(downloadLink);
// };

// Individual exports for testing
export default function* editorSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  const rawSlideshow: Slideshow = yield db.getItem('slideshow');
  yield setSlideshow(rawSlideshow);
}
