/**
 *
 * HowToModal
 *
 */

import React, { useState, useCallback } from 'react';

import { FormattedMessage } from 'react-intl';
import { Button } from 'quinoa-design-library';
import Modal from 'components/Modal';
import './styles.css';

import messages from './messages';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from 'react-accessible-accordion';

// interface OwnProps {}
const accordiable = [{
  title: messages.load,
  text: messages.loadDescription,
  vimeoId: '372868240',
  url: '/chargement_zoom_titre_Tesselle.mp4',
}, {
  title: messages.globalComment,
  text: messages.globalCommentDescription,
  vimeoId: '372868373',
  url: '/commentaireGeneral_Tesselle.mp4',
}, {
  title: messages.annotation,
  text: messages.annotationDescription,
  vimeoId: '372868393',
  url: '/commentaireSpecifique_Tesselle.mp4',
}, {
  title: messages.preview,
  text: messages.previewDescription,
  vimeoId: '372868540',
  url: '/Preview_Tesselle.mp4',
}, {
  title: messages.export,
  text: messages.exportDescription,
  url: '/download_and_reload_Tesselle1.mp4',
  vimeoId: '372868484',
}];

export const useHowToModal = () => {
  const [open, setOpen] = useState<boolean>(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const modale = (
    <Modal
      isOpen={open}
      onRequestClose={closeModal}
      contentLabel="How to save and publish"
      title={<FormattedMessage {...messages.title} />}
    >
      <Accordion allowZeroExpanded>
        {accordiable.map((etage) => {
          return (
            <AccordionItem key={etage.url}>
              <AccordionItemHeading>
                <AccordionItemButton>
                  <h3><FormattedMessage {...etage.title} /></h3>
                  <p>
                    <FormattedMessage {...etage.text} />
                  </p>
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
              <iframe
                src={`https://player.vimeo.com/video/${etage.vimeoId}?title=0&byline=0&portrait=0`}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              </AccordionItemPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Modal>
  );
  const openButton = (
    <Button
      data-for="tooltip"
      data-tip="Learn how to use Tesselle"
      onClick={openModal}
      isColor="info"
      isFullWidth
    >Learn</Button>
  );
  return [
    openButton,
    modale,
    openModal,
    closeModal,
  ];
};

// const HowToModal: React.SFC<OwnProps> = (props: OwnProps) => {
//   return (
//     <div>
//       <FormattedMessage {...messages.header} />
//     </div>
//   );
// };

// export default HowToModal;
