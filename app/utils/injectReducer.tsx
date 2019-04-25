import * as React from 'react';
import getInjectors from './reducerInjectors';
import { InjectReducerParams, LifeStore } from 'types';
import { ReactReduxContext } from 'react-redux';
/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */

export default function hocWithReducer<P>({ key, reducer }: InjectReducerParams) {
  function wrap(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> {
    // dont wanna give access to HOC. Child only
    const ReducerInjector: React.SFC<any> = (props) => {
      const context = React.useContext(ReactReduxContext);
      React.useEffect(() => {
        const injectors = getInjectors(context.store as LifeStore);
        injectors.injectReducer(key, reducer);
      });
      return <WrappedComponent {...props} />;
    };

    return ReducerInjector;
  }
  return wrap;
}
