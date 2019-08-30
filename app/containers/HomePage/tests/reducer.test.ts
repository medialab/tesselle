import { List } from 'immutable';
import homePageReducer from '../reducer';
import { loadSlideshowsAction, removeSlideshowAction } from '../actions';
import Slideshow from 'types/Slideshow';

const createSlidehow = (...args) => new Slideshow(...args);
describe('homePageReducer', () => {
  
  const firstSlideshow = createSlidehow();
  const secondSlideshow = createSlidehow();
  it('returns the initial state', () => {
    expect(
      homePageReducer(undefined, {} as any),
    ).toEqual({
      slideshows: List([]),
    });
  });

  it('should handle the loadSlideshows action', () => {
    expect(
      homePageReducer(
        undefined,
        loadSlideshowsAction(
          [
            firstSlideshow.toJS(),
            secondSlideshow.toJS(),
          ],
        ),
      ),
    ).toStrictEqual({
      slideshows: List([firstSlideshow, secondSlideshow]),
    });
  });

  it('should handle the removeSlideshow action', () => {
    expect(
      homePageReducer(
        {
          slideshows: List([firstSlideshow, secondSlideshow]),
        },
        removeSlideshowAction.success(secondSlideshow),
      ),
    ).toStrictEqual({
      slideshows: List([firstSlideshow]),
    });
  });
});
