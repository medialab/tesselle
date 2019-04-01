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
import { isImmutable, Set, isCollection, List } from 'immutable';

export const initialState: ContainerState = {
  slideshow: null,
  selectedAnnotations: Set(),
  map: null,
};

function selectionReducer(state: ContainerState, action: ContainerActions) {
  if (isCollection(action.payload)) {
    return {
      ...state,
      selectedAnnotations: action.payload,
    };
  } else if (isImmutable(action.payload)) {
    const selectedAnnotations = state.selectedAnnotations.contains(action.payload as Annotation)
      ? state.selectedAnnotations.remove(action.payload as Annotation)
      : state.selectedAnnotations.add(action.payload as Annotation);
    return {
      ...state,
      selectedAnnotations: selectedAnnotations,
    };
  } else if (action.payload === undefined) {
    return {
      ...state,
      selectedAnnotations: initialState.selectedAnnotations,
    };
  }
  throw new Error('selectionReducer case');
}

const updateSelection = (nextAnnotations: List<Annotation>, selection: Set<Annotation>): Set<Annotation> => {
  const selectionsIds = selection.map(annotation => annotation.properties.id);
  return nextAnnotations.filter(annotation => selectionsIds.contains(annotation.properties.id)).toSet();
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  console.log(action.type);
  if (state.slideshow) {
    switch (action.type) {
      case ActionTypes.CHANGE_SELECTED_ANNOTATION:
        return selectionReducer(state, action);
      case ActionTypes.CHANGE_ORDER:
        return {
          ...state,
          slideshow: state.slideshow.set(
            'annotations',
            action.payload,
          ),
        };
      case ActionTypes.CREATE_ANNOTATION:
        const annotation: Annotation = fromJS(action.payload);
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.push(
              annotation,
            ),
          }),
          selectedAnnotations: Set([annotation]),
        };
      case ActionTypes.EDIT_ANNOTATION:
        const annotations: List<Annotation> = state.slideshow.annotations.map(
          when(
            equals(action.payload.annotation),
            (annotation: Annotation) => annotation.merge(
              isImmutable(action.payload.editedFeature)
              ? action.payload.editedFeature
              : fromJS(action.payload.editedFeature),
            ),
          ),
        );
        return {
          ...state,
          slideshow: state.slideshow.set(
            'annotations',
            annotations,
          ),
          selectedAnnotations: updateSelection(annotations, state.selectedAnnotations),
        };
      case ActionTypes.REMOVE_ANNOTATION:
        return {
          ...state,
          selectedAnnotations: state.selectedAnnotations.remove(action.payload),
          slideshow: state.slideshow.set(
            'annotations',
            state.slideshow.annotations.remove(
              state.slideshow.annotations.indexOf(action.payload),
            ),
          ),
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
