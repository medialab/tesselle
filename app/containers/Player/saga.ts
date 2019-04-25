import db from 'utils/db';
import { put } from 'redux-saga/effects';
import { createSlideshowAction } from './actions';

// Individual exports for testing
export default function* playerSaga() {
  // See example in containers/HomePage/saga.js
  const rawSlideshow = yield db.getItem('slideshow');
  yield put(createSlideshowAction(rawSlideshow));
}
