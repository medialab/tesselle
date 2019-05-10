/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.HomePage';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the HomePage container!',
  },
  chapo: {
    id: `${scope}.chapo`,
// tslint:disable-next-line: max-line-length
    defaultMessage: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem similique reprehenderit nesciunt quos aut? Officiis corporis amet nam saepe error. Animi facere obcaecati cupiditate dignissimos labore, adipisci molestias reiciendis eveniet?',
  },
});
