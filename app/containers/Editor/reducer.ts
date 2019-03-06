/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import Slide from 'types/Slide';

export const initialState: ContainerState = {
  slideshow: null,
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
    case ActionTypes.CREATE_SLIDE:
      if (state.slideshow) {
        return {
          ...state,
          slideshow: Slideshow
            .builder(state.slideshow)
            .slides([...state.slideshow.slides, new Slide(action.payload)])
            .build(),
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}

export default editorReducer;
