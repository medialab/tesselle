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
import Cover from 'types/Cover';
import { List } from 'immutable';
import { setSlideshows } from 'containers/HomePage/saga';
import makeSelectSlideshows from 'containers/HomePage/selectors';

const selectSlicer = makeSelectSlicer();
const selectSlideshows = makeSelectSlideshows();

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

function* initializeSlicer(nbImages) {
  return put(setProgress((yield select(selectSlicer)).set('total', nbImages).set('present', 0)));
}

export function* slice(img, id: string, slicing = true) {
  const scaleFactors = scaleFactorsCreator(
    BASE_TILESIZE,
    img.width,
    BASE_TILESIZE,
    img.height,
  );
  const azeaze = generateInfo(img, scaleFactors, id);
  db.setItem(`/info/${id}.json`, azeaze);

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
    const infojson = yield db.getItem(`/info/${slideshow.image.id}.json`);
    zip.file('info.json', JSON.stringify(infojson));
    const images = zip.folder('images');
    const allKeys = yield db.keys();
    const imageUrls = yield all(allKeys.filter((key: string): boolean =>
      key.startsWith(`/${slideshow.image.id}`),
    ));
    for (const url of imageUrls) {
      const imgFile = yield call([db, db.getItem], url);
      images.file(url, imgFile);
    }
    zip.generateAsync({type: 'blob'}).then(content =>
      saveAs(content, `${slideshow.name}.zip`),
    );
  } catch (e) {
    console.log('error');
    console.error(e);
  }
}

function* importSlideshow(action) {
  console.log(importSlideshow);
  const newZip = new JSzip();
  // more files !
  const zip = yield newZip.loadAsync(action.payload);
  const images = zip.filter(relativePath => relativePath.startsWith(`images`) && relativePath.endsWith('jpg'));
  yield initializeSlicer(images.length);
  const rawSlideshow = JSON.parse(yield zip.file('slideshow.json').async('string'));
  const rawInfo = JSON.parse(yield zip.file('info.json').async('string'));
  yield db.setItem(`/info/${rawInfo['@id']}.json`, rawInfo);
  const thumbnail = new File(
    [yield zip.file('thumbnail.jpg').async('blob')],
    `thumbnail.jpg`,
    {type: 'image/jpeg'},
  );
  let cover = new Cover(rawSlideshow.image);
  cover = cover.set(
    'file',
    thumbnail,
  );
  let slideshow = new Slideshow(rawSlideshow);
  slideshow = slideshow.set('image', cover);
  let slicerState = yield select(selectSlicer);
  for (const zipEntry of images) {
    const relativePath = zipEntry.name;
    const file = new File(
      [yield zipEntry.async('blob')],
      `native.jpg`,
      {type: 'image/jpeg'},
    );
    yield db.setItem(`/${relativePath.slice(8)}`, file);
    slicerState = slicerState.set('present', slicerState.present + 1).set('level', 1);
    yield put(setProgress(slicerState));
  }
  const slideshows: List<Slideshow> = yield select(selectSlideshows);
  yield setSlideshows(slideshows.push(slideshow));

  console.log(slideshow);
}

// Individual exports for testing
export default function* slicerSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(ActionTypes.EXPORT_START, exportSlideshow);
  yield takeLatest(ActionTypes.IMPORT_SLIDESHOW, importSlideshow);
}
