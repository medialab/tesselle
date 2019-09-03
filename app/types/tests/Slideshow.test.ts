import Slideshow, { Meta } from 'types/Slideshow';
import { List } from 'immutable';
import Cover from 'types/Cover';

function testAll(slideshow) {
  expect(slideshow.id.length).toBeGreaterThan(5);
  expect(slideshow.name).toMatch('Untitled image');
  expect(slideshow.annotations).toEqual(List([]));
  expect(slideshow.image).toBeInstanceOf(Cover);
  expect(slideshow.meta).toBeInstanceOf(Meta);
}

describe('Slideshow', () => {
  it('should create an empty slideshow instance', () => {
    const slideshow = new Slideshow();
    expect(slideshow).toBeDefined();
  });
  it('should create a slideshow with default informations', () => {
    const slideshow = new Slideshow();
    testAll(slideshow);
  });
  it('should recreate a slideshow exactly', () => {
    const slideshow = new Slideshow();
    const newSlideshow = new Slideshow(slideshow.toJS());
    expect(newSlideshow).toStrictEqual(slideshow);
    testAll(slideshow);
  });
});
