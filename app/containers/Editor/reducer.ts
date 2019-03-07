/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  slideshow: null,
  selectedSlide: 0,
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  switch (action.type) {
    case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
      return {
        ...state,
        slideshow: Slideshow.builder()
          .id(action.payload.id)
          .image(action.payload.image)
          .slides(action.payload.slides)
          .build(),
      };
    case ActionTypes.CREATE_SLIDE_SUCCESS:
      if (state.slideshow) {
        return {
          ...state,
          slideshow: Slideshow
            .builder(state.slideshow)
            .slides([...state.slideshow.slides, action.payload])
            .build(),
          selectedSlide: state.slideshow.slides.length + 1,
        };
      } else {
        return state;
      }
    case ActionTypes.REMOVE_SLIDE:
      if (state.slideshow) {
        return {
          ...state,
          slideshow: Slideshow
            .builder(state.slideshow)
            .slides(state.slideshow.slides.filter(
              slide => slide.id !== action.payload.id,
            ))
            .build(),
        };
      }
      return state;
    default:
      return state;
  }
}

export default editorReducer;
