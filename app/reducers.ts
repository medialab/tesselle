/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from 'utils/history';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import {reducer as toastrReducer} from 'react-redux-toastr/lib';
/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default function createReducer(injectedReducers = {}) {

  // Wrap the root reducer and return a new root reducer with router state
  const routerReducer = connectRouter(history);

  const rootReducer = combineReducers({
    language: languageProviderReducer,
    router: routerReducer,
    toastr: toastrReducer,
    ...injectedReducers,
  });
  return rootReducer;
}
