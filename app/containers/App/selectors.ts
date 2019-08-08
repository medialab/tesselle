import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the slicer state domain
 */

const selectSlicerDomain = (state: ApplicationRootState) => {
  return (state && state.slicer) ? state.slicer : initialState;
};

/**
 * Other specific selectors
 */

/**
 * Default selector used by Slicer
 */

const selectSlicer = () =>
  createSelector(
    selectSlicerDomain,
    substate => substate,
  );

export const selectExportStatus = () =>
  createSelector(
    selectSlicerDomain,
    (substate) => substate.exporting,
  );

export const makeHelpModalStatusSelector = () =>
  createSelector(
    selectSlicerDomain,
    (substate) => substate.helpModalStatus,
  );

export default selectSlicer;
export { selectSlicerDomain };
