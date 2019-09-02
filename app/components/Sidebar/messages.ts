/*
 * Sidebar Messages
 *
 * This contains all the text for the Sidebar component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.components.Sidebar';

export default defineMessages({
  annotationPlaceholder: {
    id: `${scope}.annotationPlaceholder`,
    defaultMessage: 'Write an annotation about this image part',
  },
  commentPlaceholder: {
    id: `${scope}.annotationPlaceholder`,
    defaultMessage: 'Write an annotation about the whole image',
  },
});
