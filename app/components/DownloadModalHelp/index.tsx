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
import {
  Field,
  Control,
  Checkbox,
} from 'quinoa-design-library';
import Modal from 'components/Modal';

interface OwnProps {
  isOpen: boolean;
  onRequestClose: () => void;
}
const initialShowHelpAtEachDownload = localStorage.getItem('tesselle/show-help-at-each-download') === 'true' ? 'true' : 'false';

const DownloadModalHelp: React.SFC<OwnProps> = (props: OwnProps) => {
  const { isOpen, onRequestClose } = props;
  const [showHelpAtEachDownload, setShowHelpAtEachDownload] = React.useState<string>(initialShowHelpAtEachDownload);
  const onCheck = () => {
    if (showHelpAtEachDownload === 'true') {
      localStorage.setItem('tesselle/show-help-at-each-download', 'false');
      setShowHelpAtEachDownload('false');
    } else {
      localStorage.setItem('tesselle/show-help-at-each-download', 'true');
      setShowHelpAtEachDownload('true');
    }
  };
  const title = <FormattedMessage {...messages.header} />;
  const footer = (
    <Field>
      <Control>
        <Checkbox style={{marginRight: '1rem'}} onChange={onCheck} checked={showHelpAtEachDownload === 'true'}>
          Show this help at each download
        </Checkbox>
      </Control>
    </Field>
  );
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="How to save and publish"
      title={title}
      footer={footer}
    >
      <p>In order to get your data out there, the archive downloaded from Tesselle when clicking on the "download" button can be used in two ways:</p>
      <ol>
        <li>to <b>archive your work</b>, version it, or share it with coworkers, and possibly to re-upload from the homepage of the tool later</li>
        <li>to <b>publish your work</b> on the web</li>
      </ol>
      <p>
        For the matter of publication, the archived folder which is downloaded from the tool is a <b>plain static website that can be uploaded anywhere on a personal server or web hosting service</b>.
      </p>
      <p>
        For instance, you can use <a href="https://app.netlify.com/drop" target="blank" rel="noopener">Netlify drop</a> as a free and straightforward way to publish the site of the web. To do so, go to the <a href="https://app.netlify.com/drop" target="blank" rel="noopener">Netlify drop</a> webpage, drag and drop the downloaded archive file on it, and ... that's it, your document is online !
      </p>
      <p>
        As an alternative, you can also use github pages as a publication solution. You can refer to this <a href="https://www.youtube.com/watch?v=8hrJ4oN1u_8" target="blank" rel="noopener">video tutorial</a> for that matter.
      </p>
    </Modal>
  );
};

export default DownloadModalHelp;
