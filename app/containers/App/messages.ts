/*
 * App Messages
 *
 * This contains all the text for the App container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.App';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the App container!',
  },
});
