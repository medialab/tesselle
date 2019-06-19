import { call, put, select, spawn, takeLatest, all } from 'redux-saga/effects';
import { last, groupBy, pipe, values, sort, splitAt } from 'ramda';
import saveAs from 'save-file';
import html from './export-file';

import { generate, scaleFactorsCreator, generateInfo } from 'types/IIIFStatic';
import db from 'utils/db';
import { setProgress } from './actions';
import makeSelectSlicer from './selectors';
import ActionTypes from './constants';
import Slideshow from 'types/Slideshow';
import JSzip from 'jszip';
import Cover from 'types/Cover';
import { List, isImmutable } from 'immutable';
import makeSelectSlideshows from 'containers/HomePage/selectors';
import { loadSlideshowsAction } from 'containers/HomePage/actions';

const selectSlicer = makeSelectSlicer();
const selectSlideshows = makeSelectSlideshows();

const BASE_TILESIZE = 512;

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

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

function* initializeSlicer(nbImages) {
  let slicer = yield select(selectSlicer);
  slicer = slicer.set('total', nbImages).set('present', 0);
  yield put(setProgress(slicer));
  return slicer;
}

export function* slice(img, id: string, slicing = true) {
  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );
  db.setItem(`/info/${id}.json`, generateInfo(img, scaleFactors, id));
  if (slicing) {
    try {
      const parsedImage = Array.from(generate(
        img,
        {tileSize: 512, scaleFactors: scaleFactors},
      ));
      yield initializeSlicer(parsedImage.length);
      const [backgroundImages, futurImages] = pipe(
        groupBy(last),
        values,
        sort(matrice => last(last(matrice))),
        splitAt(2),
      )(parsedImage);
      yield* rawSlice(futurImages, yield select(selectSlicer), id);
      yield spawn(function*(images, sliceState, slideshowId) {
        yield* rawSlice(images, sliceState, slideshowId);
        yield put(setProgress());
      }, backgroundImages, yield select(selectSlicer), id);
    } catch (e) {
      console.error(e);
    }
  }
}

function* exportSlideshow(action) {
  try {
    const slideshow = action.payload as Slideshow;
    const zip = new JSzip();
    zip.file(slideshow.image.file.name, slideshow.image.file);
    zip.file('slideshow.json', JSON.stringify(slideshow));
    zip.file('_headers', `/*
    Access-Control-Allow-Origin: *`);
    zip.file('index.html', html);
    const infojson = yield db.getItem(`/info/${slideshow.image.id}.json`);
    zip.file('info.json', JSON.stringify(infojson));
    const images = zip.folder('images');
    const allKeys = yield db.keys();
    const imageUrls = yield all(allKeys.filter((key: string): boolean =>
      key.startsWith(`/${slideshow.image.id}`),
    ));
    for (const url of imageUrls) {
      const imgFile = yield call([db, db.getItem], url);
      images.file(url.replace(`/${slideshow.image.id}`, ''), imgFile);
    }
    zip.generateAsync({type: 'blob'}).then(content =>
      saveAs(content, `${slideshow.name}.zip`),
    );
  } catch (e) {
    console.log('error');
    console.error(e);
  }
}

function* importSlideshow(zip: JSzip) {
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  const rawSlideshow = JSON.parse(yield zip.file('slideshow.json').async('string'));
  if (slideshows.some(s => s.id === rawSlideshow.id)) {
    delete rawSlideshow.id;
  }
  const sameNameSlideshow = slideshows.find(s => s.name.startsWith(rawSlideshow.name));
  if (sameNameSlideshow) {
    rawSlideshow.name = `${sameNameSlideshow.name} - 2`;
  }
  return new Slideshow(rawSlideshow);
}

function* importInfos(zip: JSzip) {
  let info = zip.file('info.json');
  info = JSON.parse(yield call([info, info.async], 'string'));
  db.setItem(`/info/${info['@id']}.json`, info);
  return info;
}

function* importThumbnail(zip: JSzip) {
  return new File(
    [yield zip.file('thumbnail.jpg').async('blob')],
    `thumbnail.jpg`,
    {type: 'image/jpeg'},
  );
}

function* importZip(action) {
  const zip = new JSzip();
  // more files !
  yield zip.loadAsync(action.payload);
  const images = zip.filter(relativePath => relativePath.startsWith(`images`) && relativePath.endsWith('jpg'));
// tslint:disable-next-line: prefer-const
  let [rawInfo, thumbnail, slicerState, slideshow] = yield all([
    call(importInfos, zip),
    call(importThumbnail, zip),
    call(initializeSlicer, images.length),
    call(importSlideshow, zip),
  ]);
  slideshow = slideshow.set('image', new Cover(slideshow.image).set(
    'file',
    thumbnail,
  ));
  for (const zipEntry of images) {
    const relativePath = zipEntry.name;
    const file = new File(
      [yield zipEntry.async('blob')],
      `native.jpg`,
      {type: 'image/jpeg'},
    );
    yield db.setItem(`/${rawInfo['@id']}/${relativePath.slice(8)}`, file);
    slicerState = slicerState.set('present', slicerState.present + 1).set('level', 1);
    yield put(setProgress(slicerState));
  }
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  yield setSlideshows(slideshows.push(slideshow));
  yield put(setProgress());
}

// Individual exports for testing
export default function* slicerSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.EXPORT_START, exportSlideshow);
  yield takeLatest(ActionTypes.IMPORT_SLIDESHOW, importZip);
}