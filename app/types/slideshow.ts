import uuid from 'uuid';
import { split, nth, curry, map, pipe } from 'ramda';
import Slide from './Slide';
import Cover from './Cover';

class Slideshow {
  public id: string = uuid();
  public slides: Slide[] = [];
  public image: Cover;
  constructor(image: Cover) {
    this.image = image;
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
const xmlSerializer = new XMLSerializer();

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

export const slideshowCreator = (file: File): Promise<Slideshow> =>
  new Promise((resolve, reject) => {
    if (file.type === svgType) {
      const reader = new FileReader();
      reader.onload = () => {
        const container = document.createElement('div');
        container.innerHTML = reader.result as string;
        const svgElement = container.getElementsByTagName('svg')[0] as Element;
        try {
          const box: Box = getSvgSize(svgElement);
          const cover = new Cover(file, box.width, box.height);
          return resolve(new Slideshow(cover));
        } catch (error) {
          svgElement.setAttribute('width', maxX);
          svgElement.setAttribute('height', maxY);
          const newFile: File = new File([
            new Blob(
              [xmlSerializer.serializeToString(svgElement)],
              {type: svgType},
            ),
          ], file.name, {type: svgType});
          const box: Box = getSvgSize(svgElement);
          const cover: Cover = new Cover(newFile, box.width, box.height);
          return resolve(new Slideshow(cover));
        }
      };
      reader.readAsText(file);
      reader.onerror = reject;
    } else {
      const url = window.URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.width === 0) {
          return reject(new Error('Slideshow.image has a width of 0'));
        }
        if (img.height === 0) {
          return reject(new Error('Slideshow.image has a height of 0'));
        }
        const cover: Cover = new Cover(file, img.width, img.height);
        return resolve(new Slideshow(cover));
      };
      img.onerror = reject;
      img.src = url;
    }
  });
