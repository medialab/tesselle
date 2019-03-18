/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import Annotation from 'types/Annotation';

import { when, equals } from 'ramda';
import { fromJS } from 'utils/geo';
import { isImmutable } from 'immutable';

export const initialState: ContainerState = {
  slideshow: null,
  selectedAnnotation: 1,
  map: null,
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  if (state.slideshow) {
    switch (action.type) {
      case ActionTypes.CHANGE_ORDER:
        return {
          ...state,
          slideshow: state.slideshow.set('annotations', action.payload),
        };
      case ActionTypes.CREATE_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.push(
              fromJS(action.payload),
            ),
          }),
        };
      case ActionTypes.EDIT_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.set(
            'annotations',
            state.slideshow.annotations.map(
              when(
                equals(action.payload.annotation),
                (annotation: Annotation) => annotation.merge(
                  isImmutable(action.payload.editedFeature)
                  ? action.payload.editedFeature
                  : fromJS(action.payload.editedFeature),
                ),
              ),
            ),
          ),
        };
      case ActionTypes.REMOVE_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.remove(
              state.slideshow.annotations.indexOf(action.payload),
            ),
          }),
        };
    }
  }
  switch (action.type) {
    case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
      return {
        ...state,
        slideshow: new Slideshow({
          id: action.payload.id,
          image: action.payload.image,
          annotations: action.payload.annotations.map(fromJS),
        }),
      };
    case ActionTypes.SET_MAP:
      if (state.map !== action.payload) {
        return {
          ...state,
          map: action.payload,
        };
      }
      return state;
    default:
      return state;
  }
}

export default editorReducer;
