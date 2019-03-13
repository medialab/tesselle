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

// export function* createSlide(action) {
//   const slideshow: Slideshow = yield select(selectSlideshow);
//   const map = yield select(makeMapSelector());
//   const bounds: LatLngBounds = new LatLngBounds(
//     map.unproject([0, slideshow.image.height], map.getMaxZoom()),
//     map.unproject([slideshow.image.width, 0], map.getMaxZoom()),
//   );
//   const projected = [
//     map.project(
//       bounds.getSouthWest(), map.getMaxZoom(),
//     ),
//     map.project(
//       bounds.getNorthEast(), map.getMaxZoom(),
//     ),
//   ];
//   try {
//     const imgFile = yield loadImage(
//       slideshow.image.file,
//       {
//         maxWidth: 120,
//         maxHeight: 120,
//         top: projected[1].y,
//         right: projected[1].x,
//         bottom: projected[0].y,
//         left: projected[0].x,
//       },
//     );
//     yield put(
//       createSlideAction.success({
//         frame: bounds,
//         file: imgFile,
//       }),
//     );
//   } catch (e) {
//     console.log('error');
//     console.error(e);
//   }
// }

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
//   downloadLink.download = 'newesttree.jpg';
//   document.body.appendChild(downloadLink);
//   downloadLink.click();
//   document.body.removeChild(downloadLink);
// };

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
  yield takeLatest(ActionTypes.EDIT_ANNOTATION, saveSlideshow);
  try {
    const rawSlideshow: Slideshow = yield db.getItem('slideshow');
    // const slideshow = Slideshow.builder(rawSlideshow).build();
    if (rawSlideshow) {
      console.log(rawSlideshow);
      yield setSlideshow(rawSlideshow);
    } else {
      yield put(push('/'));
    }
  } catch (e) {
    console.error(e);
  }
}
