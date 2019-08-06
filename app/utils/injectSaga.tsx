import * as React from 'react';
import { ReactReduxContext } from 'react-redux';

import getInjectors from './sagaInjectors';
import { InjectSagaParams } from 'types';

/**
 * Dynamically injects a saga, passes component's props as saga arguments
 *
 * @param {string} key A key of the saga
 * @param {function} saga A root saga that will be injected
 * @param {string} [mode] By default (constants.RESTART_ON_REMOUNT) the saga will be started on component mount and
 * cancelled with `task.cancel()` on component un-mount for improved performance. Another two options:
 *   - constants.DAEMON—starts the saga on component mount and never cancels it or starts again,
 *   - constants.ONCE_TILL_UNMOUNT—behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 */

export default function hocWithSaga<P>({ key, saga, mode }: InjectSagaParams) {
  function wrap(
    WrappedComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    // dont wanna give access to HOC. Child only
    const InjectSaga: React.SFC<any> = (props) => {
      const context = React.useContext(ReactReduxContext);
      React.useLayoutEffect(() => {
        const injectors = getInjectors(context.store as any);
        injectors.injectSaga(key, { saga: saga, mode: mode }, props);
        return () => {
          injectors.ejectSaga(key);
        };
      }, []);
      return <WrappedComponent {...props} />;
    };
    InjectSaga.displayName = `withSaga(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`;
    return InjectSaga;
  }
  return wrap;
}
