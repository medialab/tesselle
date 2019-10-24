/**
 *
 * Modal
 *
 */

import * as React from 'react';

// import styled from 'styles/styled-components';

interface OwnProps {
  title: React.ReactElement;
  footer: React.ReactElement;
}

import Modal from 'react-modal';
import { Button, Title, Icon, Content, Notification } from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

Modal.setAppElement('#app');

const Modale: React.SFC<OwnProps & any> = (props: OwnProps & any) => {
  return (
    <Modal {...props}>
      <div className="modal-content-container">
        <div className="modal-content-header">
          <Title isSize="3">
            <span>{props.title}</span>
            <span>
              <Button onClick={props.onRequestClose} isRounded>
                <Icon><FontAwesomeIcon icon={faTimes} /></Icon>
              </Button>
            </span>
          </Title>
        </div>
        <div className="modal-content-body">
          <Notification>
            <Content>
              {props.children}
            </Content>
          </Notification>
          <div style={{ paddingLeft: '1rem' }}>
            {props.footer}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const useVideoModale = (props: {title: string, urls: string[]}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const openModal = React.useCallback(() => setOpen(true), []);
  const closeModal = React.useCallback(() => setOpen(false), []);
  const modal = (
    <Modale isOpen={open} title={props.title} onRequestClose={closeModal}>
      <video controls autoPlay>
        {props.urls.map(src => (
          <source key={src} src={src} />
        ))}
      </video>
    </Modale>
  );

  return [
    openModal,
    modal,
  ];
};

export default Modale;
