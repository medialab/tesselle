/**
 *
 * Slicer
 *
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSlicer, { selectExportStatus } from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles.css';
import { ContainerState } from './types';
import { exportSlideshowActionCreator } from './actions';
import { makeSelectSlideshow } from 'containers/Editor/selectors';

const selectSlideshow = makeSelectSlideshow();
const slicerSelector = makeSelectSlicer();

export const useExport = (slideshow = useSelector(selectSlideshow)) => {
  const dispatch = useDispatch();
  const state = useSelector(selectExportStatus());
  console.log('useExport#state', state);
  const callback = useCallback(
    () => dispatch(exportSlideshowActionCreator.request(slideshow)),
    [dispatch, slideshow],
  );
  return [state, callback];
};

export const useSlicerState = () => useSelector(slicerSelector) as ContainerState;

export function Loader() {
  const slicer = useSlicerState();
  if (slicer && slicer.total === 0) {
    return <React.Fragment />;
  }
  return (
    <div>
      <progress
        className="progress is-primary"
        value={`${(slicer.present / slicer.total) * 100}`}
        max="100">{Math.floor(slicer.present / slicer.total) * 100}</progress>
    </div>
  );
}

const withReducer = injectReducer({ key: 'slicer', reducer: reducer });
const withSaga = injectSaga({ key: 'slicer', saga: saga });

export const slicerContainer = compose(withReducer, withSaga);

export default Loader;
