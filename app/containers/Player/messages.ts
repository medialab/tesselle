/*
 * Player Messages
 *
 * This contains all the text for the Player container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Player';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the Player container!',
  },
});
