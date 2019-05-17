import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the homePage state domain
 */

const selectHomePageDomain = (state: ApplicationRootState) => {
  return (state && state.homePage) ? state.homePage : initialState;
};

/**
 * Other specific selectors
 */

/**
 * Default selector used by HomePage
 */

const selectHomePage = () =>
  createSelector(
    selectHomePageDomain,
    substate => {
      return substate.slideshows;
    },
  );

const makeSelectSlicing = () =>
  createSelector(
    selectHomePageDomain,
    substate => substate.slicing,
  );

export default selectHomePage;
export { selectHomePageDomain, makeSelectSlicing };
