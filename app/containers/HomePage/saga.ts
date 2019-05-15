import { put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';

import makeSelectSlideshows from './selectors';

const selectSlideshows = makeSelectSlideshows();

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

export function* createSlideshow(action, slice) {
  try {
    const slideshow: Slideshow = yield slideshowCreator(action.payload, slice);
    const slideshows: List<Slideshow> = yield select(selectSlideshows);
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

export function* removeSlideshow(action) {
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  db.setItem('slideshows', slideshows.toJS());
  const allKeys = yield db.keys();
  const myKeys = allKeys.filter((key: string) => key.startsWith(action.payload.idid));
  // We could yield to wait for all items to be removed, but I don't see the point ATM.
  myKeys.forEach((key: string) =>
    db.removeItem(key),
  );
}

// Individual exports for testing
export default function* homePageSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield takeLatest(ActionTypes.REMOVE_SLIDESHOW, removeSlideshow);
  try {
    let rawSlideshows = yield db.getItem('slideshows');
    if (rawSlideshows === null) {
      rawSlideshows = [];
    }
    yield setSlideshows(rawSlideshows);
  } catch (e) {
    console.error('Could not retrive slideshows');
    console.error(e);
  }
}
