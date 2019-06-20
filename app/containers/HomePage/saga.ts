import { put, takeLatest, select, all, call } from 'redux-saga/effects';
// import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction, removeSlideshowAction } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';
import makeSelectSlideshows from './selectors';
import { slice, colisionDetection } from 'containers/Slicer/saga';
import { push } from 'connected-react-router';
import { setProgress } from 'containers/Slicer/actions';
import makeSelectSlicer from 'containers/Slicer/selectors';

const selectSlideshows = makeSelectSlideshows();
const selectSlicer = makeSelectSlicer();

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

export function* duplicateSlideshow(action) {
  const slideshow = yield colisionDetection(action.payload);
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  yield setSlideshows(slideshows.push(
    slideshow,
  ));
}

export function* createSlideshow(action, sliceing) {
  try {
    const [slideshow, img]: [Slideshow, (HTMLImageElement | SVGElement)] =
      yield slideshowCreator(action.payload, sliceing);
    yield* slice(img, slideshow.image.id, sliceing);
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
  const sliceState = yield select(selectSlicer);
  const nexd = sliceState.set('total', 500);
  yield put(setProgress(nexd));
  const slideshow = yield createSlideshow(action, true);
  // sagas: slidehsow created
  // sagas: redirect to editor
  yield put(push('/editor/' + slideshow.id));
}

export function* removeSlideshow(action) {
  // const slideshows: List<Slideshow> = yield select(selectSlideshows);
  const slideshow = action.payload as Slideshow;
  let slideshows = yield call([db, db.getItem], 'slideshows');
  slideshows.forEach(slideshow => console.log(slideshow.image.id));
  const slidedhowId = slideshow.id;
  const imageId = slideshow.image.id;
  slideshows = slideshows.filter(slideshow => slideshow.id !== slidedhowId);
  db.setItem('slideshows', slideshows);
  if (!slideshows.some(s => s.image.id === slideshow.image.id)) {
    const allKeys = yield db.keys();
    yield all(allKeys.filter((key: string): boolean =>
      key.startsWith(`/${imageId}`),
    ).map(key =>
      call([db, db.removeItem], key)),
    );
  }
  yield put(removeSlideshowAction.success(action));
  // We could yield to wait for all items to be removed, but I don't see the point ATM.
}

// Individual exports for testing
export default function* homePageSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.CREATE_SLIDESHOW, createAndRedirect);
  yield takeLatest(ActionTypes.REMOVE_SLIDESHOW, removeSlideshow);
  yield takeLatest(ActionTypes.SLIDESHOW_DUPLICATE, duplicateSlideshow);
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
