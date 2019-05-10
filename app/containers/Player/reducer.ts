/*
 *
 * Player reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';

// new Slideshow({
//   name: action.payload.name,
//   image: action.payload.image,
//   annotations: action.payload.annotations.map(fromJS),
// })

// import { fromJS } from 'utils/geo';
// import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  slideshow: null,
};

export default combineReducers<ContainerState, ContainerActions>({
  slideshow: (state = initialState.slideshow, action) => {
    switch (action.type) {
      case ActionTypes.DEFAULT_ACTION:
        return state;
      default:
        return state;
    }
  },
});
