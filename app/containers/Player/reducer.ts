/*
 *
 * Player reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { fromJS } from 'utils/geo';
import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  default: null,
  map: null,
};

export default combineReducers<ContainerState, ContainerActions>({
  default: (state = initialState.default, action) => {
    switch (action.type) {
      case ActionTypes.CREATE_SLIDESHOW:
        return new Slideshow({
          id: action.payload.id,
          image: action.payload.image,
          annotations: action.payload.annotations.map(fromJS),
        });
      default:
        return state;
    }
  },
  map: (state = initialState.map, action) => {
    switch (action.type) {
      case ActionTypes.SET_MAP:
        return state;
    }
    return state;
  },
});
