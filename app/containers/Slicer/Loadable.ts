/**
 *
 * Asynchronously loads the component for Slicer
 *
 */

import loadable from 'loadable-components';

export default loadable(() => import('./index'));
