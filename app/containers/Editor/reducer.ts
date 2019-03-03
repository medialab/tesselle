/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  slideshow: null,
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  switch (action.type) {
    case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
      return {
        ...state,
        slideshow: action.payload as Slideshow,
      };
    default:
      return state;
  }
}

export default editorReducer;

// export default combineReducers<ContainerState, ContainerActions>({
//   slideshow: (state = initialState, action) => {
//     console.log(action);
//     switch (action.type) {
//       case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
//         return state;
//       default:
//         return state;
//     }
//   },
// });
