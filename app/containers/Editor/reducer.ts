/*
 *
 * Editor reducer
 *
 */

import { combineReducers } from 'redux';

import ActionTypes from './constants';
import HomePageActionTypes from 'Containers/HomePage/constants';
import { ContainerState, ContainerActions } from './types';
import Annotation from 'types/Annotation';

import { when } from 'ramda';
import { fromJS } from 'utils/geo';
import { isImmutable, List } from 'immutable';
import Slideshow from 'types/Slideshow';

export const initialState: ContainerState = {
  slideshow: null,
  selectedAnnotations: List(),
};

const replaceAnnotation = action => when(
  action.payload.annotation.equals.bind(action.payload.annotation),
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
            const annotation = action.payload as Annotation;
            if (selectedAnnotations.contains(annotation)) {
              return selectedAnnotations.remove(selectedAnnotations.indexOf(annotation));
            }
            return List([annotation]);
          }
        }
        return initialState.selectedAnnotations;
      case ActionTypes.EDIT_ANNOTATION:
        return selectedAnnotations.map(replaceAnnotation(action));
      case ActionTypes.REMOVE_ANNOTATION:
        return selectedAnnotations.remove(selectedAnnotations.indexOf(action.payload));
    }
    return selectedAnnotations;
  },
  slideshow: (slideshow = initialState.slideshow, action) => {
      if (slideshow) {
        switch (action.type) {
          case HomePageActionTypes.LOAD_SLIDESHOWS as any:
            return initialState.slideshow;
          case ActionTypes.CHANGE_ORDER:
            return slideshow.set(
              'annotations',
              action.payload,
            );
          case ActionTypes.CREATE_ANNOTATION:
            return slideshow.set(
              'annotations',
              slideshow.annotations.push(fromJS(action.payload)),
            );
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
    }
      switch (action.type) {
        case ActionTypes.EDIT_SLIDESHOW:
          if (isImmutable(action.payload)) {
            return action.payload;
          }
          return new Slideshow({
            id: action.payload.id,
            name: action.payload.name,
            image: action.payload.image,
            annotations: action.payload.annotations.map(fromJS),
          });
        }
      return slideshow;
  },
});
