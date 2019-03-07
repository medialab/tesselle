import { takeLatest, put, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import loadImage from 'utils/imageManipulation';

import ActionTypes from './constants';
import Slideshow, { slideshowCreator } from '../../types/Slideshow';
import { createSlideshowAction, createSlideAction } from './actions';
import db from '../../utils/db';
import { makeSelectSlideshow } from './selectors';
import { LatLngBoundsExpression, Point } from 'leaflet';
import Slide from 'types/Slide';

const selectSlideshow = makeSelectSlideshow();

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

export function* createSlide(action) {
  const {frame, projected}: {frame: LatLngBoundsExpression, projected: Point[]} = action.payload;
  const slideshow: Slideshow = yield select(selectSlideshow);
  const imgFile = yield loadImage(
    slideshow.image.file,
    {
      maxWidth: 120,
      maxHeight: 120,
      top: projected[1].y,
      right: projected[1].x,
      bottom: projected[0].y,
      left: projected[0].x,
    },
  );
  yield put(createSlideAction.success(new Slide(frame, imgFile)));
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
// const saveImg = (imageFile: File): void => {
//   const downloadLink = document.createElement('a');
//   downloadLink.href = window.URL.createObjectURL(imageFile);
//   downloadLink.target = '_blank';
//   console.log(downloadLink);
//   downloadLink.download = 'newesttree.jpg';
//   document.body.appendChild(downloadLink);
//   downloadLink.click();
//   console.log('ben ui');
//   document.body.removeChild(downloadLink);
// };

export function* saveSlideshow(action: any) {
  const slideshow: Slideshow = yield select(selectSlideshow);
  yield db.setItem('slideshow', slideshow);
}

// Individual exports for testing
export default function* editorSaga() {
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield takeLatest(ActionTypes.CREATE_SLIDE, createSlide);
  yield takeLatest(ActionTypes.CREATE_SLIDE_SUCCESS, saveSlideshow);
  yield takeLatest(ActionTypes.REMOVE_SLIDE, saveSlideshow);
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
