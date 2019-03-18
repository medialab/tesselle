import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the editor state domain
 */

const selectEditorDomain = (state: ApplicationRootState) => {
  return (state && state.editor)  ? state.editor : initialState;
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
    substate => substate && substate.slideshow,
  );

export const makeMapSelector = () =>
  createSelector(
    selectEditorDomain,
    substate => substate && substate.map,
  );

const privateAnnotationSelector = createSelector(
  selectEditorDomain,
  (domain) => domain.selectedAnnotation,
);

export const makeSelectAnnotationSelector = () =>
  createSelector(
    makeSelectSlideshow(),
    privateAnnotationSelector,
    (slideshow, index) => {
      return slideshow && slideshow.annotations.get(index);
    },
  );

export default selectEditor;
export { selectEditorDomain };
