import { call, put, select, spawn, takeLatest, all } from 'redux-saga/effects';
import { last, equals, pipe, nth, sort, splitWhen } from 'ramda';
import { saveAs } from 'file-saver';
import html from './export-file';
import uuid from 'uuid';

import { generate, scaleFactorsCreator } from 'types/IIIFStatic';
import db from 'utils/db';
import { setProgress, exportSlideshowActionCreator, setHelpModalStatus } from './actions';
import makeSelectSlicer from './selectors';
import ActionTypes from './constants';
import Slideshow from 'types/Slideshow';
import JSzip from 'jszip';
import Cover from 'types/Cover';
import { List, isImmutable } from 'immutable';
import makeSelectSlideshows from 'containers/HomePage/selectors';
import { loadSlideshowsAction } from 'containers/HomePage/actions';
import { typesToExtensions, extentionsToType } from 'utils/';

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
  for (const [url, launchFileParsing, sf] of images) {
    sliceState = sliceState.set('present', sliceState.present + 1).set('level', sf);
    yield put(setProgress(sliceState));
    yield call([db, db.setItem], '/' + slideshowId + url, launchFileParsing());
  }
  yield put(setProgress(sliceState));
}

function* initializeSlicer(nbImages) {
  let slicer = yield select(selectSlicer);
  slicer = slicer.set('total', nbImages).set('present', 0);
  yield put(setProgress(slicer));
  return slicer;
}

export function* slice(img, id: string, scaleFactors = scaleFactorsCreator(
  BASE_TILESIZE,
  img.width,
  BASE_TILESIZE,
  img.height,
)) {
  let toCancel;
  try {
    const parsedImage = Array.from(generate(
      img,
      {tileSize: 512, scaleFactors: scaleFactors},
    ));
    toCancel = yield initializeSlicer(parsedImage.length);
    const compareTo = nth(-3, scaleFactors);
    const [futurImages, backgroundImages] = pipe(
      sort(matrice => -last(matrice)),
      splitWhen(dup => equals(compareTo, last(dup))),
    )(parsedImage);
    toCancel = yield* rawSlice(futurImages, yield select(selectSlicer), id);
    toCancel = yield spawn(function*(images, sliceState, slideshowId) {
      yield* rawSlice(images, sliceState, slideshowId);
      yield put(setProgress());
    }, backgroundImages, yield select(selectSlicer), id);
  } catch (error) {
    toCancel.cancel();
    throw error;
  }
}

function* exportSlideshow(action) {
  try {
    const slideshow = action.payload as Slideshow;
    const zip = new JSzip();
    zip.file(`thumbnail.${typesToExtensions(slideshow.image.file.type)}`, slideshow.image.file);
    zip.file('slideshow.json', JSON.stringify(slideshow));
    zip.file('_headers', `/*
    Access-Control-Allow-Origin: *`);
    zip.file('index.html', html(slideshow));
    const infojson = yield db.getItem(`/info/${slideshow.image.id}.json`);
    zip.file('info.json', JSON.stringify(infojson));
    const images = zip.folder('images');
    const allKeys = yield db.keys();
    const imageUrls = yield all(allKeys.filter((key: string): boolean =>
      key.startsWith(`/${slideshow.image.id}`),
    ));
    for (const url of imageUrls) {
      images.file(url.replace(`/${slideshow.image.id}`, ''), yield call([db, db.getItem], url));
    }
    saveAs(yield zip.generateAsync({type: 'blob'}), `${slideshow.name}.zip`);
    yield put(exportSlideshowActionCreator.success());
  } catch (e) {
    console.error(e);
  }
}

export function* colisionDetection(slideshow) {
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  if (slideshows.some(s => s.id === slideshow.id)) {
    slideshow = slideshow.set('id', uuid());
  }
  const sameNameSlideshows = slideshows.filter(s => s.name.startsWith(slideshow.name));
  if (sameNameSlideshows.size >= 1) {
    slideshow = slideshow.set('name', `${sameNameSlideshows.first<Slideshow>().name} - ${sameNameSlideshows.size + 1}`);
  }
  return slideshow;
}

function* importSlideshow(zip: JSzip) {
  const rawSlideshow = JSON.parse(yield zip.file('slideshow.json').async('string'));
  return yield* colisionDetection(new Slideshow(rawSlideshow));
}

function* importInfos(zip: JSzip) {
  let info = zip.file('info.json');
  info = JSON.parse(yield call([info, info.async], 'string'));
  yield db.setItem(`/info/${info['@id']}.json`, info);
  return info;
}

function* importThumbnail(zip: JSzip, fileFormat) {
  const name = `thumbnail.${fileFormat}`;
  return new File(
    [yield zip.file(name).async('blob')],
    name,
    {type: extentionsToType(fileFormat)},
  );
}

function* importZip(action) {
  const zip = new JSzip();
  // more files !
  yield zip.loadAsync(action.payload);
  const images = zip.filter(relativePath => relativePath.startsWith(`images`) && relativePath.endsWith('jpg'));
  const rawInfo = yield call(importInfos, zip);
// tslint:disable-next-line: prefer-const
  let [thumbnail, slicerState, slideshow] = yield all([
    call(importThumbnail, zip, rawInfo.formats[0]),
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
      {type: extentionsToType(rawInfo.formats[0])},
    );
    yield db.setItem(`/${rawInfo['@id']}/${relativePath.slice(8)}`, file);
    slicerState = slicerState.set('present', slicerState.present + 1).set('level', 1);
    yield put(setProgress(slicerState));
  }
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  yield setSlideshows(slideshows.push(slideshow));
  yield put(setProgress());
}

function * openModal(action) {
  if (
    localStorage.getItem('tesselle/show-help-at-each-download') === 'true'
    || localStorage.getItem('tesselle/has-already-downloaded') !== 'true'
  ) {
    if (localStorage.getItem('tesselle/has-already-downloaded') !== 'true') {
      localStorage.setItem('tesselle/has-already-downloaded', 'true');
    }
    yield put(setHelpModalStatus(true));
  }
}

// Individual exports for testing
export default function* slicerSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.EXPORT_START, exportSlideshow);
  yield takeLatest(ActionTypes.IMPORT_SLIDESHOW, importZip);
  yield takeLatest(ActionTypes.EXPORT_SUCCESS, openModal);
}
