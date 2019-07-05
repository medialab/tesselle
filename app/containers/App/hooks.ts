import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import makeSelectSlicer, { selectExportStatus } from './selectors';
import { exportSlideshowActionCreator } from './actions';
import { makeSelectSlideshow } from 'containers/Editor/selectors';
import { ContainerState } from './types';

const selectSlideshow = makeSelectSlideshow();
const slicerSelector = makeSelectSlicer();
export const useSlicerState = () => useSelector(slicerSelector) as ContainerState;

export const useExport = (slideshow = useSelector(selectSlideshow)) => {
  const dispatch = useDispatch();
  const state = useSelector(selectExportStatus());
  const callback = React.useCallback(() =>
    dispatch(exportSlideshowActionCreator.request(slideshow),
  ), [dispatch, slideshow]);
  return [state, callback];
};
