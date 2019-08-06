import invariant from 'invariant';
import { where, is } from 'ramda';

const isFunction = is(Function);
const isObject = is(Object);

/**
 * Validate the shape of redux store
 */
export default function checkStore(store) {
  const shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    runSaga: isFunction,
    injectedReducers: isObject,
    injectedSagas: isObject,
  };
  invariant(
    where(shape, store),
    '(app/utils...) injectors: Expected a valid redux store',
  );
}
