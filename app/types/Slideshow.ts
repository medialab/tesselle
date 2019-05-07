import { Record, List } from 'immutable';
import { split, nth, curry, map, pipe } from 'ramda';
import Annotation from 'types/Annotation';
import slicer from 'utils/slice';
import db from 'utils/db';
import Cover from './Cover';

interface SlideshowArgs {
  name?: string;
  annotations?: List<Annotation>;
  image?: Cover;
}

class Slideshow extends Record({
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
        params.annotations = List<Annotation>(params.annotations);
      }
      super(params);
    } else {
      super();
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

const generateInfo = img => {
  return {
    '@context': 'http://library.stanford.edu/iiif/image-api/1.1/context.json',
    '@id': 'test-image',
    'formats': ['jpg'],
    'height': img.height,
    'profile': 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0',
    'qualities': ['native'],
    'scale_factors': [
      1,
      2,
      4,
    ],
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
        await db.setItem('info.json', generateInfo(img));
        if (slicing) {
          for (const [url, file] of await slicer(img)) {
            await db.setItem(url, file);
          }
        }
        return resolve(new Slideshow({
          image: new Cover({
            file: slicing,
            width: img.width,
            height: img.height,
          }),
        }));
      };
      img.onerror = (error) => {
        console.error(error);
        reject(error);
      };
      img.src = url;
    }
  });
