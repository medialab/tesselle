/*
 *
 * Editor reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import Annotation from 'types/Annotation';

import { when, equals } from 'ramda';
import { fromJS } from 'utils/geo';
import { isImmutable, List } from 'immutable';

export const initialState: ContainerState = {
  slideshow: null,
  selectedAnnotations: List(),
  map: null,
};

const replaceAnnotation = action => when(
  equals(action.payload.annotation),
  (annotation: Annotation) => annotation.merge(
    isImmutable(action.payload.editedFeature)
    ? action.payload.editedFeature
    : fromJS(action.payload.editedFeature),
  ),
);

export default combineReducers<ContainerState, ContainerActions>({
  selectedAnnotations: (selectedAnnotations = initialState.selectedAnnotations, action: ContainerActions) => {
    switch (action.type) {
      case ActionTypes.CHANGE_SELECTED_ANNOTATION:
        if (action.payload) {
          if (action.payload instanceof List) {
            return action.payload as any;
          } else {
            const annotation: Annotation = action.payload as Annotation;
            if (selectedAnnotations.contains(annotation)) {
              return selectedAnnotations.remove(selectedAnnotations.indexOf(annotation));
            }
            return List([annotation]);
          }
        }
        return selectedAnnotations;
      case ActionTypes.EDIT_ANNOTATION:
        return selectedAnnotations.map(replaceAnnotation(action));
      case ActionTypes.REMOVE_ANNOTATION:
        return selectedAnnotations.remove(selectedAnnotations.indexOf(action.payload));
    }
    return selectedAnnotations;
  },
  map: (map = initialState.map, action) => {
    if (action.type === ActionTypes.SET_MAP && map !== action.payload) {
      return action.payload;
    }
    return map;
  },
  slideshow: (slideshow = initialState.slideshow, action) => {
    if (slideshow) {
      switch (action.type) {
        case ActionTypes.CHANGE_ORDER:
          return slideshow.set(
            'annotations',
            action.payload,
          );
        case ActionTypes.CREATE_ANNOTATION:
          const annotation: Annotation = fromJS(action.payload);
          return slideshow.with({
            annotations: slideshow.annotations.push(
              annotation,
            ),
          });
        case ActionTypes.EDIT_ANNOTATION:
          return slideshow.set(
            'annotations',
            slideshow.annotations.map(replaceAnnotation(action)),
          );
        case ActionTypes.REMOVE_ANNOTATION:
            return slideshow.set(
              'annotations',
              slideshow.annotations.remove(
                slideshow.annotations.indexOf(action.payload),
              ),
            );
      }
      return slideshow;
    }
    switch (action.type) {
      case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
        return new Slideshow({
          id: action.payload.id,
          image: action.payload.image,
          annotations: action.payload.annotations.map(fromJS),
        });
    }
    return slideshow;
  },
});
