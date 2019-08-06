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
    case ActionTypes.SET_HELP_MODAL_STATUS:
      return state.set('helpModalStatus', action.payload);
    default:
      return state;
  }
}

export default slicerReducer;
