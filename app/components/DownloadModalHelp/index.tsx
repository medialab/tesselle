// tslint:disable: max-line-length

/**
 *
 * DownloadModalHelp
 *
 */

import * as React from 'react';

// import styled from 'styles/styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Modal from 'react-modal';
import {
  Button,
  Title,
  Icon,
  Content,
} from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

Modal.setAppElement('#app');

interface OwnProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const DownloadModalHelp: React.SFC<OwnProps> = (props: OwnProps) => {
  const { isOpen, onRequestClose } = props;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="How to save and publish"
    >
      <div className="modal-content-container">
        <div className="modal-content-header">
          <Title isSize="3">
            <span><FormattedMessage {...messages.header} /></span>
            <span>
              <Button onClick={onRequestClose} isRounded>
                <Icon><FontAwesomeIcon icon={faTimes} /></Icon>
              </Button>
            </span>
          </Title>
        </div>
        <div className="modal-content-body">
          <Content style={{padding: '2rem 0'}}>
              <p>In order to get your data out there, the archive downloaded from Tesselle when clicking on the "download" button can be used in two ways:</p>
              <ol>
                <li>to archive your work, version it, or share it with coworkers, and possibly to re-upload from the homepage of the tool later</li>
                <li>to publish your work on the web</li>
              </ol>
              <p>
                For the matter of publication, the archived folder which is downloaded from the tool is a plain static website that can be uploaded anywhere on a personal server or web hosting service.
              </p>
              <p>
                For instance, you can use <a href="https://app.netlify.com/drop" target="blank" rel="noopener">Netlify drop</a> as a free and straightforward way to publish the site of the web. To do so, go to the <a href="https://app.netlify.com/drop" target="blank" rel="noopener">Netlify drop</a> webpage, drag and drop the downloaded archive file on it, and ... that's it, your document is online !
              </p>
              <p>
                As an alternative, you can also use github pages as a publication solution. You can refer to this <a href="https://www.youtube.com/watch?v=8hrJ4oN1u_8" target="blank" rel="noopener">video tutorial</a> for that matter.
              </p>
          </Content>

        </div>
      </div>
    </Modal>
  );
};

export default DownloadModalHelp;
