/*
 *
 * Slicer reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import { SliceState } from './SliceArgs';

export const initialState: ContainerState = {
  default: new SliceState(),
};

// function slicerReducer(state: ContainerState = initialState, action: ContainerActions ) {
//   switch (action.type) {
//     case ActionTypes.DEFAULT_ACTION:
//       return state;
//     default:
//       return state;
//   }
// }

// export default slicerReducer;

export default combineReducers<ContainerState, ContainerActions>({
  default: (state = initialState.default, action) => {
    switch (action.type) {
      case ActionTypes.SET_PROGRESS:
        return action.payload ? action.payload : initialState.default;
      default:
        return state;
    }
  },
});
