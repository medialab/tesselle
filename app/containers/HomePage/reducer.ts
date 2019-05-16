/*
 *
 * HomePage reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { List, Record } from 'immutable';
// import { fromJS } from 'utils/geo';
import Slideshow from 'types/Slideshow';

interface SliceArgs {
  total?: number;
  present?: number;
}

export class SliceState extends Record<SliceArgs>({
  total: 0,
  present: 0,
}) {
  public readonly total!: number;
  public readonly present!: number;
}

export const initialState: ContainerState = {
  slideshows: List([]),
  slicing: new SliceState(),
};

export default combineReducers<ContainerState, ContainerActions>({
  slicing: (state = initialState.slicing, action) => {
    switch (action.type) {
      case ActionTypes.SET_PROGRESS:
        return action.payload;
    }
    return state;
  },
  slideshows: (state = initialState.slideshows, action) => {
    switch (action.type) {
      case ActionTypes.LOAD_SLIDESHOWS:
        return List(action.payload.map((params) => new Slideshow(params)));
      case ActionTypes.REMOVE_SLIDESHOW:
        return state.remove(state.indexOf(action.payload));
      default:
        return state;
    }
  },
});
