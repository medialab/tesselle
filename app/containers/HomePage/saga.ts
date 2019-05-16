import { call, put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction, setProgress } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';
import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import { splitAt } from 'ramda';

import makeSelectSlideshows from './selectors';
import { SliceState } from './reducer';

const selectSlideshows = makeSelectSlideshows();
const BASE_TILESIZE = 512;

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}
// const okimages = [61, 62, 63, 64];
function* slice(img, slidehsowId: string, slicing) {
  // yield 'direct';
  console.log('fork started');

  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );

  yield db.setItem('/' + slidehsowId + '/info.json', generateInfo(img, scaleFactors, slidehsowId));
  if (slicing) {
    try {
      const parsedImage = Array.from(generate(
        img,
        {tileSize: 512, scaleFactors: [1]},
      ));
      const nbImages = parsedImage.length;
      const sliceState = new SliceState({total: nbImages});

      const [canWait, cantWait] = splitAt(Math.floor(nbImages / 2), parsedImage);

      console.log(scaleFactors, nbImages);

      for (let index = 0; index < cantWait.length; index++) {
        const [url, launchFileParsing]  = cantWait[index];
        yield put(setProgress(sliceState.set('present', index + 1)));
        yield call([db, db.setItem], '/' + slidehsowId + url, launchFileParsing());
      }
      Promise.all(
        canWait.map(([url, launchFileParsing]) =>
          db.setItem('/' + slidehsowId + url, launchFileParsing())))
          .then(() => console.log('wolo c oké'),
      );
    } catch (e) {
      console.error(e);
    }
  }
}

export function* createSlideshow(action, sliceing) {
  try {
    const [slideshow, img] = yield slideshowCreator(action.payload, sliceing);
    console.log('slideshow created');
    console.log('launch fork');
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
  console.log('start create slideshow');
  const slideshow = yield createSlideshow(action, true);
  console.log('end create slideshow');
  // sagas: slidehsow created
  // sagas: redirect to editor
  console.log('redirect now');
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
