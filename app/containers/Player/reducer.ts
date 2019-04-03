/*
 *
 * Player reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { fromJS } from 'utils/geo';
import Slideshow from 'types/slideshow';

export const initialState: ContainerState = {
  default: null,
  map: null,
};

export default combineReducers<ContainerState, ContainerActions>({
  default: (state = initialState.default, action) => {
    console.log('default', state, action.type);
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
    console.log('map', state, action.type);
    switch (action.type) {
      case ActionTypes.SET_MAP:
        return state;
    }
    return state;
  },
});
