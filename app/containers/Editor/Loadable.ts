/**
 *
 * Asynchronously loads the component for Editor
 *
 */

import loadable from 'loadable-components';

export default loadable(() => import('./index'));
