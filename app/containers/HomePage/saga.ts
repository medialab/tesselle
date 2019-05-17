import { call, put, takeLatest, select, spawn, fork } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction, setProgress } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';
import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import { last, groupBy, pipe, values, sort, splitAt } from 'ramda';
import makeSelectSlideshows, { makeSelectSlicing } from './selectors';

const selectSlideshows = makeSelectSlideshows();
const selectSlicing = makeSelectSlicing();

const BASE_TILESIZE = 512;

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

function* rawSlice(images, sliceState, slideshowId) {
  for (const imagesByScaleFactor of images) {
    for (const [url, launchFileParsing] of imagesByScaleFactor) {
      sliceState = sliceState.set('present', sliceState.present + 1);
      yield put(setProgress(sliceState));
      yield call([db, db.setItem], '/' + slideshowId + url, launchFileParsing());
    }
    const sf = last(last(imagesByScaleFactor));
    console.log(sf, imagesByScaleFactor);
  }
  return sliceState;
}

function* slice(img, slideshowId: string, slicing) {

  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );

  yield db.setItem('/' + slideshowId + '/info.json', generateInfo(img, scaleFactors, slideshowId));

  if (slicing) {
    try {
      const parsedImage = Array.from(generate(
        img,
        {tileSize: 512, scaleFactors: scaleFactors},
      ));
      const nbImages = parsedImage.length;
      yield put(setProgress((yield select(selectSlicing)).set('total', nbImages)));
      const [futurImages, backgroundImages] = pipe(
        groupBy(last),
        values,
        sort(matrice => -last(last(matrice))),
        splitAt(2),
      )(parsedImage);
      yield fork(rawSlice, futurImages, yield select(selectSlicing), slideshowId);
      yield spawn(rawSlice, backgroundImages, yield select(selectSlicing), slideshowId);
    } catch (e) {
      console.error(e);
    }
  }
}

export function* createSlideshow(action, sliceing) {
  try {
    const [slideshow, img] = yield slideshowCreator(action.payload, sliceing);
    // const koi = yield* slice(img, slideshow, sliceing);
    const koi = yield call(slice, img, slideshow.id, sliceing);
    console.log('done slicing', koi);
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
