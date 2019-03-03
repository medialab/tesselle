import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the editor state domain
 */

const selectEditorDomain = (state: ApplicationRootState) => {
  return state ? state.editor : initialState;
};

/**
 * Other specific selectors
 */

/**
 * Default selector used by Editor
 */

const selectEditor = () =>
  createSelector(selectEditorDomain, substate => {
    return substate;
  });

export const makeSelectSlideshow = () =>
  createSelector(
    selectEditorDomain,
    substate => substate.slideshow,
  );

export default selectEditor;
export { selectEditorDomain };
