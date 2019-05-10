/*
 *
 * HomePage reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { List } from 'immutable';

export const initialState: ContainerState = {
  slideshows: List([]),
};

export default combineReducers<ContainerState, ContainerActions>({
  slideshows: (state = initialState.slideshows, action) => {
    switch (action.type) {
      case ActionTypes.LOAD_SLIDESHOWS:
        return List(action.payload);
      default:
        return state;
    }
  },
});
