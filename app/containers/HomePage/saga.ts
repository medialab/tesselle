import { call, put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import db from 'utils/db';
import { loadSlideshowsAction } from './actions';
import Slideshow, { slideshowCreator } from 'types/Slideshow';
import ActionTypes from 'containers/HomePage/constants';
import { List, isImmutable } from 'immutable';
import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import { last } from 'ramda';

import makeSelectSlideshows from './selectors';

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

  console.log('set info.json');
  yield db.setItem('/' + slidehsowId + '/info.json', generateInfo(img, scaleFactors, slidehsowId));
  console.log('setted info.json');
  if (slicing) {
    try {
      const first = new Date();
      // const queue: FuturImageParsing[] = [];
      console.log('start boucle');
      const parsedImage = Array.from(generate(
        img,
        {tileSize: 512, scaleFactors: scaleFactors},
      ));

      const levels = scaleFactors.reduce((prev: any[], scale, index) => {
        const lastMatrice = last(prev);
        if (!lastMatrice) {
          return [[0]];
        }
        const start = last(lastMatrice);
        return [...prev, Array(scale * scale).fill(0).map((_, i) => i + (start + 1))];
      }, []);
      const mapedImages = levels.map(zoomMatrice => zoomMatrice.map(index => parsedImage[index]));
      console.log(levels, mapedImages);
      console.log('hebé');

      // for (const [url, launchFileParsing] of ) {
      //   i++;
      //   // Commencer par la fin du tableau
      //   if (okimages.includes(i)) {
      //     console.log(i, 'parse and wait', url);
      //     yield call([db, db.setItem], '/' + slidehsowId + url, launchFileParsing());
      //   } else {
      //     console.log(i, 'oui c bon gogo', url);
      //     db.setItem('/' + slidehsowId + url, launchFileParsing());
      //   }
      // }
      const nd = new Date();
      console.log(first, nd, (nd as any) - (first as any));
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
