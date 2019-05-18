/**
 *
 * LoadingModal
 *
 */

import * as React from 'react';

import { ModalCard } from 'quinoa-design-library';

// interface OwnProps {

// }

const LoadingModal: React.SFC<any> = (props) => {
  return (
    <ModalCard {...props} mainContent={props.children} />
  );
};

export default LoadingModal;
