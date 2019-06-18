import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the viewer state domain
 */

const selectViewerDomain = (state: ApplicationRootState) => {
  return state ? state : initialState;
};

/**
 * Other specific selectors
 */

/**
 * Default selector used by Viewer
 */

const selectViewer = () =>
  createSelector(
    selectViewerDomain,
    substate => {
      return substate;
    },
  );

export default selectViewer;
export { selectViewerDomain };
