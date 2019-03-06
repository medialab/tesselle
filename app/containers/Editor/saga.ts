import { takeLatest, put, select } from 'redux-saga/effects';
import ActionTypes from './constants';
import Slideshow, { slideshowCreator } from '../../types/Slideshow';
import { createSlideshowAction } from './actions';
import { push } from 'react-router-redux';
import db from '../../utils/db';
import { makeSelectSlideshow } from './selectors';

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

const selectSlideshow = makeSelectSlideshow();

export function* saveSlideshow(action: any) {
  const slideshow: Slideshow = yield select(selectSlideshow);
  yield db.setItem('slideshow', slideshow);
}

// Individual exports for testing
export default function* editorSaga() {
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield takeLatest(ActionTypes.CREATE_SLIDE, saveSlideshow);
  try {
    const rawSlideshow: Slideshow = yield db.getItem('slideshow');
    const slideshow = Slideshow.builder(rawSlideshow).build();
    if (rawSlideshow) {
      yield setSlideshow(slideshow);
    } else {
      yield put(push('/'));
    }
  } catch (e) {
    console.log('là');
    console.error(e);
  }
}
