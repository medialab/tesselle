import { execute } from 'wasm-imagemagick';
import { call, put, select, takeLatest, all, fork } from 'redux-saga/effects';
import { splitEvery } from 'ramda';
import { saveAs } from 'file-saver';
import html from './export-file';
import uuid from 'uuid';

import { scaleFactorsCreator, staticPartialTileSizes, path } from 'types/IIIFStatic';
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
import { resizeImage } from 'utils/imageManipulation';

const selectSlicer = makeSelectSlicer();
const selectSlideshows = makeSelectSlideshows();

// const BASE_TILESIZE = 512;

export function* setSlideshows(slideshows: any) {
  if (isImmutable(slideshows)) {
    yield db.setItem('slideshows', slideshows.toJS());
  }
  yield put(loadSlideshowsAction(slideshows));
}

function* initializeSlicer(nbImages: number) {
  let slicer = yield select(selectSlicer);
  slicer = slicer.set('total', nbImages).set('present', 0);
  yield put(setProgress(slicer));
  return slicer;
}

const delay = ms => new Promise((resolve) => setTimeout(resolve, ms));

function* loaderState(nbImages: number) {
  const slicer = yield initializeSlicer(nbImages);
  let task = false;
  let oldI = 0;
  return function* koi(index: number, sf: number) {
    if (task) {
      oldI = index;
      return;
    }
    task = true;
    yield delay(1000);
    task = false;
    return yield put(setProgress(slicer.set('present', oldI)));
  };
}

export function* slice(img, id: string, buffer) {
  let toCancel;
  console.log('qu est ce que tu veux ?????');
  try {
    const { width, height } = img;
    const tileSize = 512;
    const bitArray = new Uint8Array(buffer);
    const scaleFactors: number[] = scaleFactorsCreator(
      tileSize,
      width,
      tileSize,
      height,
    );
    const tileSizeMatrice = Array.from(
      staticPartialTileSizes(
        width,
        height,
        tileSize,
        scaleFactors,
      ),
    );
    const nbImages = tileSizeMatrice.length;
    const loader = yield loaderState(nbImages);
    console.log(nbImages);
    console.log(scaleFactors);
    console.time('all');
    for (const sizes of splitEvery(300)(tileSizeMatrice)) {
      console.time('small');
      const lines = sizes.reduce((accumulator, [region, size]) => {
        const [rx, ry, rw, rh] = region;
        const [sw, sh] = size;
        if (sw > 0) {
          return `${accumulator} \\
\\( mpr:XY -crop '${rw}x${rh}+${rx}+${ry}' -resize '${sw}x${sh}!>' +write ${path(region, size)} \\)`;
        }
        return accumulator;
      }, '');
      const commands = `convert big.jpg -write mpr:XY +delete -respect-parentheses${lines} null:`;
      const res = yield execute({
        inputFiles: [{name: 'big.jpg', content: bitArray.slice(0)}],
        commands: commands,
      });
      console.timeEnd('small');
      console.log(res);
    }
    console.timeEnd('all');
    //   const acc = scaleFactors.reduce((accumulator, scale) => {
  //     const s = 1 / scale * 100;
  //     return `${accumulator} \\
  //   }, '');
//     const acc = scaleFactors.reduce((acc, n) => {
//       const s = 1 / scale * 100;
//       return `${acc}
// `;
//     }, ``)
//     const commands = `convert big.jpg -write mpr:XY +delete -respect-parentheses ${acc} \\
// null:`;
    let i = 0;
    for (const [region, size, sf] of tileSizeMatrice) {
      i = i + 1;
      yield fork(loader, i, sf);

      const image = yield resizeImage(img, region, size);
      toCancel = yield call([db, db.setItem], '/' + id + path(region, size), image);
    }
    toCancel = yield put(setProgress());
  } catch (error) {
    console.log('ici');
    console.error(error);
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
