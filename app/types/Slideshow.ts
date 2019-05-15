import { Record, List } from 'immutable';
import { split, nth, curry, map, pipe } from 'ramda';
import uuid from 'uuid';
import Annotation from 'types/Annotation';

import db from 'utils/db';
import Cover from './Cover';
import { fromJS } from 'utils/geo';
import { generate, scaleFactorsCreator } from './IIIFStatic';

export interface SlideshowArgs {
  id?: string;
  name?: string;
  annotations?: List<Annotation>;
  image?: Cover;
}

class Slideshow extends Record({
  id: '',
  name: 'Unnamed Slideshow',
  annotations: List(),
  image: {},
}) {
  public readonly name!: string;
  public readonly annotations!: List<Annotation>;
  public readonly image!: Cover;
  constructor(params?: SlideshowArgs) {
    if (params) {
      if (params.annotations instanceof Array) {
        params.annotations = List<Annotation>(params.annotations.map(fromJS));
      }
      if (!params.id) {
        params.id = uuid();
      }
      super(params);
    } else {
      const defaultParams = {
        id: uuid() as string,
      };
      super(defaultParams);
    }
  }
  public with(values: SlideshowArgs) {
    return this.merge(values) as this;
  }
}
export default Slideshow;

interface Box {
  width: number;
  height: number;
}

const maxX = '1000';
const maxY = '1000';
const svgType = 'image/svg+xml';

const createObject = curry((specification, value) => map(f => f(value), specification));
const parseWidth: () => number = pipe(nth(2), Number);
const parseHeight: () => number = pipe(nth(3), Number);
const viewBoxToSize = (viewBox: string): Box => createObject({
    width: parseWidth,
    height: parseHeight,
  }, split(' ', viewBox),
);

const getSvgSize = (svgElement: Element): Box | never => {
  const width = svgElement.getAttribute('width');
  const height = svgElement.getAttribute('height');
  const viewBox = svgElement.getAttribute('viewBox');
  if (width && height) {
    return {
      width: +width,
      height: +height,
    };
  }
  if (viewBox) {
    return viewBoxToSize(viewBox);
  }
  throw new Error('No width / height nor viewBox');
};

const BASE_TILESIZE = 512;

const generateInfo = (img, scaleFactors, id) => {
  return {
    '@context': 'http://library.stanford.edu/iiif/image-api/1.1/context.json',
    '@id': id,
    'formats': ['jpg'],
    'height': img.height,
    'profile': 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0',
    'qualities': ['default'],
    'scale_factors': scaleFactors,
    'tile_height': 512,
    'tile_width': 512,
    'width': img.width,
  };
};

export const slideshowCreator = (file: File, slicing): Promise<Slideshow> =>
  new Promise((resolve, reject) => {
    if (file.type === svgType) {
      const reader = new FileReader();
      reader.onload = () => {
        const container = document.createElement('div');
        container.innerHTML = reader.result as string;
        const svgElement = container.getElementsByTagName('svg')[0] as Element;
        try {
          const box: Box = getSvgSize(svgElement);
          return resolve(
            new Slideshow({
              image: new Cover({
                file: false,
                width: box.width,
                height: box.height,
              }),
            }));
        } catch (error) {
          svgElement.setAttribute('width', maxX);
          svgElement.setAttribute('height', maxY);
          const box: Box = getSvgSize(svgElement);
          return resolve(new Slideshow({
            image: new Cover({
              file: false,
              width: box.width,
              height: box.height,
            }),
          }));
        }
      };
      reader.readAsText(file);
      reader.onerror = reject;
    } else {
      const url = window.URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        if (img.width === 0) {
          return reject(new Error('Slideshow.image has a width of 0'));
        }
        if (img.height === 0) {
          return reject(new Error('Slideshow.image has a height of 0'));
        }
        const slideshow = new Slideshow({
          image: new Cover({
            file: slicing,
            width: img.width,
            height: img.height,
          }),
        });

        const scaleFactors = scaleFactorsCreator(
          BASE_TILESIZE,
          img.width,
          BASE_TILESIZE,
          img.height,
        );

        await db.setItem('/' + slideshow.id + '/info.json', generateInfo(img, scaleFactors, slideshow.id));

        if (slicing) {
          const first = new Date();
          for (const [url, filePromise] of generate(
            img,
            {tileSize: 512, scaleFactors: scaleFactors},
          )) {
            const file = await filePromise;
            await db.setItem('/' + slideshow.id + url, file);
            // const allP = (filePromise as Promise<File>).then(file => db.setItem('/' + slideshow.id + url, file));
          }
          const last = new Date();
          console.log(first, last, (last as any) - (first as any));
        }
        window.URL.revokeObjectURL(url);
        return resolve(slideshow);
      };
      img.onerror = (error) => {
        console.error(error);
        reject(error);
      };
      img.src = url;
    }
  });
