import { put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';

import makeSelectSlideshows from './selectors';

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

export function* createSlideshow(action, slice) {
  try {
    const slideshow: Slideshow = yield slideshowCreator(action.payload, slice);
    const slideshows: List<Slideshow> = yield select(makeSelectSlideshows());
    yield setSlideshows(slideshows.push(slideshow));
    return slideshow;
  } catch (e) {
    console.info('This should not happend');
    console.error(e);
  }
}

export function* createAndRedirect(action) {
  // sagas: createSlideshow
  const slideshow = yield createSlideshow(action, true);
  // sagas: slidehsow created
  // sagas: redirect to editor
  yield put(push('/editor/' + slideshow.id));
}

console.log(ActionTypes);

// Individual exports for testing
export default function* homePageSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  try {
    const rawSlideshows = yield db.getItem('slideshows') || [];
    yield setSlideshows(rawSlideshows);
  } catch (e) {
    console.error('Could not retrive slideshows');
    console.error(e);
  }
}
