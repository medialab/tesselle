/*
 *
 * HomePage actions
 *
 */

import { action, createAsyncAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow, { SlideshowArgs } from 'types/Slideshow';

export const loadSlideshowsAction = (slideshows: SlideshowArgs[]) =>
  action(ActionTypes.LOAD_SLIDESHOWS, slideshows);

export const createSlideshowAction = createAsyncAction(
  ActionTypes.CREATE_SLIDESHOW,
  ActionTypes.CREATE_SLIDESHOW_SUCCESS,
  ActionTypes.CREATE_SLIDESHOW_FAILURE,
)<File, Slideshow, Error>();


export const removeSlideshowAction = createAsyncAction(
  ActionTypes.REMOVE_SLIDESHOW,
  ActionTypes.REMOVE_SLIDESHOW_SUCCESS,
  ActionTypes.REMOVE_SLIDESHOW_FAILURE,
)<Slideshow, Slideshow, Error>();
