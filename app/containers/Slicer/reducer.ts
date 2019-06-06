/*
 *
 * Slicer reducer
 *
 */

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import SliceState from './SliceArgs';

export const initialState: ContainerState = new SliceState();

function slicerReducer(state: ContainerState = initialState, action: ContainerActions) {
  switch (action.type) {
    case ActionTypes.SET_PROGRESS:
      return action.payload ? action.payload : initialState;
    default:
      return state;
  }
}

export default slicerReducer;
