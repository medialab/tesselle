/*
 *
 * Editor actions
 *
 */

import { createAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow from 'types/Slideshow';
import Annotation from 'types/Annotation';
import { List } from 'immutable';
import { Feature, Point } from 'geojson';

export const addAnnotationAction = createAction(ActionTypes.CREATE_ANNOTATION, action => {
  return (feature: Feature<Point, any>) => action(feature);
});

export const removeAnnotationAction = createAction(
  ActionTypes.REMOVE_ANNOTATION,
  action => (annotation: Annotation) => action(annotation),
);

export const editAnnotationAction = createAction(
  ActionTypes.EDIT_ANNOTATION,
  action => (annotation: Annotation, editedFeature: any) => action({
    annotation: annotation,
    editedFeature: editedFeature,
  }),
);

export const editOrderAction = createAction(
  ActionTypes.CHANGE_ORDER,
  action => (annotations: List<Annotation>) => action(annotations),
);

export const changeSelectionAction = createAction(
  ActionTypes.CHANGE_SELECTED_ANNOTATION,
  action => (select?: Annotation | List<Annotation>, meta?) => action(select, meta),
);

export const editSlideshowAction = createAction(
  ActionTypes.EDIT_SLIDESHOW,
  action => (slideshow: Slideshow) => action(slideshow),
);
