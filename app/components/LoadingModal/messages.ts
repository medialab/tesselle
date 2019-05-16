/*
 * LoadingModal Messages
 *
 * This contains all the text for the LoadingModal component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.components.LoadingModal';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the LoadingModal component!',
  },
});
