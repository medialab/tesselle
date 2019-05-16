/**
 *
 * LoadingModal
 *
 */

import * as React from 'react';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

import { ModalCard } from 'quinoa-design-library';

// interface OwnProps {

// }

const LoadingModal: React.SFC<any> = (props) => {
  return (
    <ModalCard {...props} mainContent={props.children}>
      <FormattedMessage {...messages.header} />
    </ModalCard>
  );
};

export default LoadingModal;