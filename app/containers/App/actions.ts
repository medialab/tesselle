/*
 *
 * App actions
 *
 */

import { action, createAsyncAction } from 'typesafe-actions';

import ActionTypes from './constants';
import SliceState from './SliceArgs';
import Slideshow from 'types/Slideshow';

export const setProgress = (sliceState?: SliceState) => action(ActionTypes.SET_PROGRESS, sliceState);

export const exportSlideshowActionCreator = createAsyncAction(
  ActionTypes.EXPORT_START,
  ActionTypes.EXPORT_SUCCESS,
  ActionTypes.EXPORT_FAILURE,
)<Slideshow | null, undefined, Error>();


export const importSlideshowAction = createAsyncAction(
  ActionTypes.IMPORT_SLIDESHOW,
  ActionTypes.IMPORT_SLIDESHOW_SUCCESS,
  ActionTypes.IMPORT_SLIDESHOW_FAILURE,
)<any, Slideshow, Error>();

export const setHelpModalStatus = (status: boolean) => action(ActionTypes.SET_HELP_MODAL_STATUS, status);
