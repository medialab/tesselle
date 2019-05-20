/*
 *
 * HomePage reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { List } from 'immutable';
// import { fromJS } from 'utils/geo';
import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  slideshows: List([]),
};

export default combineReducers<ContainerState, ContainerActions>({
  slideshows: (state = initialState.slideshows, action) => {
    switch (action.type) {
      case ActionTypes.LOAD_SLIDESHOWS:
        return List(action.payload.map((params) => new Slideshow(params)));
      case ActionTypes.REMOVE_SLIDESHOW_SUCCESS:
        return state.remove(state.indexOf(action.payload));
      default:
        return state;
    }
  },
});
