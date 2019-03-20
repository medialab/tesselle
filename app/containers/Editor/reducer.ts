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
  selectedAnnotation: -1,
  map: null,
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  if (state.slideshow) {
    switch (action.type) {
      case ActionTypes.CHANGE_SELECTED_ANNOTATION:
        if (typeof(action.payload) === 'number') {
          return {
            ...state,
            selectedAnnotation: action.payload,
          };
        }
        return {
          ...state,
          selectedAnnotation: state.slideshow.annotations.indexOf(action.payload),
        };
      case ActionTypes.CHANGE_ORDER:
        return {
          ...state,
          slideshow: state.slideshow.set('annotations', action.payload),
        };
      case ActionTypes.CREATE_ANNOTATION:
        const annotation = fromJS(action.payload);
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.push(
              annotation,
            ),
          }),
          selectedAnnotation: state.slideshow.annotations.size,
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
        const index = state.slideshow.annotations.indexOf(action.payload);
        let selectedAnnotation = state.selectedAnnotation;
        if (index >= state.selectedAnnotation) {
          selectedAnnotation = index - 1;
        }
        return {
          ...state,
          selectedAnnotation: selectedAnnotation,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.remove(index),
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
