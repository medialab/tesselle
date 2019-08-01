import { Record, List } from 'immutable';
import { split, nth, curry, map, pipe } from 'ramda';
import uuid from 'uuid';
import Annotation from 'types/Annotation';

import Cover from './Cover';
import { fromJS } from 'utils/geo';
import loadImage from 'utils/imageManipulation';
import { isSvg } from 'utils/index';

export interface SlideshowArgs {
  id?: string;
  name?: string;
  annotations?: List<Annotation>;
  image?: Cover;
}

class Slideshow extends Record({
  id: '',
  name: 'Untitled image',
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
      if (!(params.image instanceof Cover)) {
        params.image = new Cover(params.image);
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

export const slideshowCreator = (file: File, name: string): Promise<[Slideshow, (HTMLImageElement | SVGElement)]> =>
  new Promise((resolve, reject) => {
    if (isSvg(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        const container = document.createElement('div');
        container.innerHTML = reader.result as string;
        const svgElement = container.getElementsByTagName('svg')[0] as SVGElement;
        try {
          const box: Box = getSvgSize(svgElement);
          return resolve([
            new Slideshow({
              name,
              image: new Cover({
                file: file,
                width: box.width,
                height: box.height,
                type: 'image/svg+xml',
              }),
            }),
            svgElement,
          ]);
        } catch (error) {
          svgElement.setAttribute('width', maxX);
          svgElement.setAttribute('height', maxY);
          const box: Box = getSvgSize(svgElement);
          return resolve([
            new Slideshow({
              name,
              image: new Cover({
                file: file,
                width: box.width,
                height: box.height,
                type: 'image/svg+xml',
              }),
            }),
            svgElement,
          ]);
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
        const MAX_DIMENSION = 100;
        const thumbnailWidth = img.width > img.height ? MAX_DIMENSION : (img.width / img.height) * MAX_DIMENSION;
        const thumbnailHeight = img.height > img.height ? MAX_DIMENSION : (img.height / img.width) * MAX_DIMENSION;
        const thumbnail = await loadImage(file, {
          maxWidth: thumbnailWidth,
          maxHeight: thumbnailHeight,
          left: 0,
          top: 0,
          bottom: img.height,
          right: img.width,
          name: 'thumbnail.jpg',
        });

        const slideshow = new Slideshow({
          name,
          image: new Cover({
            file: thumbnail,
            width: img.width,
            height: img.height,
            type: 'image/jpeg',
          }),
        });
        window.URL.revokeObjectURL(url);
        return resolve([slideshow, img]);
      };
      img.onerror = (error) => {
        console.error(error);
        reject(error);
      };
      img.src = url;
    }
  });
