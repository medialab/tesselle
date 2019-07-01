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
    case ActionTypes.EXPORT_START:
      return state.set('exporting', true);
    case ActionTypes.EXPORT_SUCCESS:
    case ActionTypes.EXPORT_FAILURE:
      return state.set('exporting', false);
    default:
      return state;
  }
}

export default slicerReducer;
