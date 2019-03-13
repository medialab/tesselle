/*
 *
 * Editor actions
 *
 */

import { action, createAsyncAction, createAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow from 'types/slideshow';
import { LatLngBounds } from 'leaflet';
import Annotation from 'types/Annotation';

export const defaultAction = () => action(ActionTypes.DEFAULT_ACTION);
export const createSlideshowAction = createAsyncAction(
    ActionTypes.CREATE_SLIDESHOW,
    ActionTypes.CREATE_SLIDESHOW_SUCCESS,
    ActionTypes.CREATE_SLIDESHOW_FAILURE,
  )<File, Slideshow, Error>();

export const addAnnotationAction = createAction(ActionTypes.CREATE_ANNOTATION, action => {
  return (feature: LatLngBounds) => action(feature);
});

export const setMap = createAction(ActionTypes.SET_MAP, action => (map: L.Map) => action(map));

export const removeAnnotationAction = createAction(
  ActionTypes.REMOVE_ANNOTATION,
  action => (annotation: Annotation) => action(annotation),
);

export const editAnnotationAction = createAction(
  ActionTypes.EDIT_ANNOTATION,
  action => (annotation: Annotation, content: string) => action({
    annotation: annotation,
    content: content,
  }),
);
