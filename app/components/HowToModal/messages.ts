    // tslint:disable: max-line-length
/*
 * HowToModal Messages
 *
 * This contains all the text for the HowToModal component.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.components.HowToModal';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'How to use Tesselle ?',
  },
  load: {
    id: `${scope}.load`,
    defaultMessage: 'How to create a Tessel project ?',
  },
  loadDescription: {
    id: `${scope}.load.description`,
    defaultMessage: 'Learn how to create a new Tesselle project and import a (possibly very big) image to display and annotate.',
  },
  globalComment: {
    id: `${scope}.globalComment`,
    defaultMessage: 'Write a general comment',
  },
  globalCommentDescription: {
    id: `${scope}.globalComment.description`,
    defaultMessage: 'Learn how to attach a comment the globality of the image (examples : an introduction, a conclusion, a transition title between two sets of annotations, ...).',
  },
  annotation: {
    id: `${scope}.annotation`,
    defaultMessage: 'Create an annotation',
  },
  annotationDescription: {
    id: `${scope}.annotation.description`,
    defaultMessage: 'Learn how to attach text to specific parts of the image, wether as rectangles, circles, or free polygon shapes.',
  },
  preview: {
    id: `${scope}.preview`,
    defaultMessage: 'Play your own Tesselle',
  },
  previewDescription: {
    id: `${scope}.preview.description`,
    defaultMessage: 'Learn how to preview the results of your work and scaffold a narrative unfolding your analysis of your image.',
  },
  export: {
    id: `${scope}.export`,
    defaultMessage: 'Export your Tesselle',
  },
  exportDescription: {
    id: `${scope}.export.description`,
    defaultMessage: 'Learn how to export your work for publication, archiving and reuse.',
  },
});
