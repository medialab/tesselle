import { call, put, select, spawn, takeLatest, all } from 'redux-saga/effects';
import { last, groupBy, pipe, values, sort, splitAt } from 'ramda';
import saveAs from 'save-file';

import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import db from 'utils/db';
import { setProgress } from './actions';
import makeSelectSlicer from './selectors';
import ActionTypes from './constants';
import Slideshow from 'types/Slideshow';
import JSzip from 'jszip';

const selectSlicer = makeSelectSlicer();

const BASE_TILESIZE = 512;

function* rawSlice(images, sliceState, slideshowId) {
  for (const imagesByScaleFactor of images) {
    const sf = last(last(imagesByScaleFactor));
    for (const [url, launchFileParsing] of imagesByScaleFactor) {
      sliceState = sliceState.set('present', sliceState.present + 1).set('level', sf);
      yield put(setProgress(sliceState));
      yield call([db, db.setItem], '/' + slideshowId + url, launchFileParsing());
    }
    yield put(setProgress(sliceState));
  }
}

export function* slice(img, slideshowId: string, slicing = true) {
  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );

  db.setItem(`/info/${slideshowId}.json`, generateInfo(img, scaleFactors, slideshowId));

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
      yield* rawSlice(futurImages, yield select(selectSlicer), slideshowId);
      yield spawn(function*(images, sliceState, slideshowId) {
        yield* rawSlice(images, sliceState, slideshowId);
        yield put(setProgress());
      }, backgroundImages, yield select(selectSlicer), slideshowId);
    } catch (e) {
      console.error(e);
    }
  }
}

function* exportSlideshow(action) {
  console.log('ouiii');
  try {
    const slideshow = action.payload as Slideshow;
    const zip = new JSzip();
    console.log(slideshow.image.file.name, slideshow.image.file.type);
    // db.getItem('');
    zip.file(slideshow.image.file.name, slideshow.image.file);
    zip.file('slideshow.json', JSON.stringify(slideshow));
    const images = zip.folder('images');
    const allKeys = yield db.keys();
    const imageUrls = yield all(allKeys.filter((key: string): boolean =>
      key.startsWith(`/${slideshow.image.id}`),
    ));
    for (const url of imageUrls) {
      const imgFile = yield call([db, db.getItem], url);
      images.file(url, imgFile);
    }
    zip.generateAsync({type: 'blob'}).then(content => {
      // see FileSaver.js
      saveAs(content, `${slideshow}.zip`);
    });
  } catch (e) {
    console.log('error');
    console.error(e);
  }
}

// Individual exports for testing
export default function* slicerSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.EXPORT_START, exportSlideshow);
}
