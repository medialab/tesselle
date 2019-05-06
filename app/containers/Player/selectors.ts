import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the player state domain
 */

const selectPlayerDomain = (state: ApplicationRootState) => {
  return (state && state.player)  ? state.player : initialState;
};

/**
 * Other specific selectors
 */

/**
 * Default selector used by Player
 */

const selectPlayer = () =>
  createSelector(
    selectPlayerDomain,
    substate => {
      return substate && substate.slideshow;
    },
  );

export default selectPlayer;
export { selectPlayerDomain };
