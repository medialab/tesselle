import uuid from 'uuid';
import { split, nth, curry, map, pipe } from 'ramda';
// import { Set } from 'immutable';
import Slide from './Slide';
import Cover from './Cover';

interface SlideshowJson {
  id: string;
  slides: Slide[];
  image: Cover;
}

class Slideshow {
  public readonly id: string;
  public readonly slides: Slide[];
  public readonly image: Cover;
  private constructor(id: string = uuid(), image: Cover, slides: Slide[] = []) {
    this.id = id;
    this.image = image;
    this.slides = slides;
  }
  public toJSON(): SlideshowJson {
    return {
      id: this.id,
      image: this.image,
      slides: this.slides,
    };
  }
  public static fromJS(json: SlideshowJson): Slideshow {
    return new Slideshow(
      json.id,
      json.image,
      json.slides,
    );
  }
  public static builder(slideshow?: Slideshow): SlideshowBuilder {
    return new SlideshowBuilder(slideshow);
  }
}

// tslint:disable-next-line: max-classes-per-file
class SlideshowBuilder {
  private json: SlideshowJson & any;
  constructor(slideshow?: Slideshow | any) {
    if (slideshow instanceof Slideshow) {
      this.json = slideshow.toJSON();
    } else if (slideshow instanceof Object) {
      this.json = {
        id: slideshow.id,
        image: slideshow.image,
        slides: slideshow.slides,
      };
    } else {
      this.json = {};
    }
  }
  public id(id: string): SlideshowBuilder {
    this.json.id = id;
    return this;
  }
  public image(imageCover: Cover): SlideshowBuilder {
    this.json.image = imageCover;
    return this;
  }
  public slides(slides: Slide[] | Slide): SlideshowBuilder {
    this.json.slides = slides instanceof Slide ? [...this.json.slides, slides] : slides;
    return this;
  }
  public build(): Slideshow {
    return Slideshow.fromJS(this.json);
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
          return resolve(Slideshow.builder().image(cover).build());
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
          return resolve(Slideshow.builder().image(cover).build());
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
        return resolve(Slideshow.builder().image(cover).build());
      };
      img.onerror = reject;
      img.src = url;
    }
  });
