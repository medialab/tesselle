import uuid from 'uuid';
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

export const slideshowCreator = (file: File): Promise<Slideshow> =>
new Promise((resolve, reject) => {
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
  img.src = url;
});
