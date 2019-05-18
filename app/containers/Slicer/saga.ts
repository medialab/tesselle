import { call, put, select, spawn, all } from 'redux-saga/effects';
import { last, groupBy, pipe, values, sort, splitAt } from 'ramda';

import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import db from 'utils/db';
import { setProgress } from './actions';
import makeSelectSlicer from './selectors';

const selectSlicer = makeSelectSlicer();

const BASE_TILESIZE = 512;

function* rawSlice(images, sliceState, slideshowId) {
  for (const imagesByScaleFactor of images) {
    const sf = last(last(imagesByScaleFactor));
    console.group();
    yield all(imagesByScaleFactor.map(function*([url, launchFileParsing], index) {
      sliceState = sliceState.set('present', sliceState.present + 1).set('level', sf);
      console.log(index % sf, index, sf);
      yield put(setProgress(sliceState));
      yield call([db, db.setItem], '/' + slideshowId + url, launchFileParsing());
    }));
    console.groupEnd();
    // for (const [url, launchFileParsing] of imagesByScaleFactor) {
    //   sliceState = sliceState.set('present', sliceState.present + 1).set('level', sf);
    //   yield put(setProgress(sliceState));
    //   yield call([db, db.setItem], '/' + slideshowId + url, launchFileParsing());
    // }
    // yield put(setProgress(sliceState));
  }
}

export function* slice(img, slideshowId: string, slicing = true) {
  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );

  db.setItem('/' + slideshowId + '/info.json', generateInfo(img, scaleFactors, slideshowId));

  if (slicing) {
    try {
      const parsedImage = Array.from(generate(
        img,
        {tileSize: 512, scaleFactors: scaleFactors},
      ));
      const nbImages = parsedImage.length;
      yield put(setProgress((yield select(selectSlicer)).set('total', nbImages).set('present', 0)));
      const [futurImages, backgroundImages] = pipe(
        groupBy(last),
        values,
        sort(matrice => last(last(matrice))),
        splitAt(2),
      )(parsedImage);
      console.log(futurImages, backgroundImages);
      yield* rawSlice(futurImages, yield select(selectSlicer), slideshowId);
      yield spawn(rawSlice, backgroundImages, yield select(selectSlicer), slideshowId);
    } catch (e) {
      console.error(e);
    }
  }
}

// Individual exports for testing
export default function* slicerSaga() {
  // See example in containers/HomePage/saga.js
}
