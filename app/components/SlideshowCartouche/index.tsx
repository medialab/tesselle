/**
 *
 * SlideshowCartouche
 *
 */

import * as React from 'react';
import { Card, Content, Level, Column, Columns, Icon, Title } from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Slideshow from 'types/Slideshow';
import { Link } from 'react-router-dom';
import { useAction, useUrl } from 'utils/hooks';
import { push } from 'connected-react-router';

import './style.css';

const InlineIcon = ({children}) => (
  <span style={{marginLeft: '.5rem', marginRight: '1rem'}}>
    <Icon isSize="small">{children}</Icon>
  </span>
);

interface OwnProps {
  slideshow: Slideshow;
  onDelete: (toDelete) => void;
}

const SlideshowCartouche: React.SFC<OwnProps> = (props: OwnProps) => {

  const goToEditor = useAction(() => push(`/editor/${props.slideshow.id}`), [props.slideshow.id]);
  const goToPlayer = useAction(() => push(`/player/${props.slideshow.id}`), [props.slideshow.id]);

  const [removing, setRemoving] = React.useState<boolean>(false);

  const onAction = React.useCallback((id, event) => {
    switch (id) {
      case 'delete':
        setRemoving(true);
        return props.onDelete(props.slideshow);
      case 'open':
        return goToEditor();
      case 'read':
        return goToPlayer();
    }
  }, [props.slideshow]);

  const thumbnail = useUrl(props.slideshow.image.file);
  return (
    <Level className="SlideshowCartouche">
      <Column>
        <Card
          onAction={onAction}
          asideActions={[{
              label: <span><InlineIcon><FontAwesomeIcon icon={faPencilAlt} /></InlineIcon>edit</span>,
              isDisabled: removing,
              isColor: 'primary',
              id: 'open',
            }, {
              label: <span><InlineIcon><FontAwesomeIcon icon={faCopy} /></InlineIcon>read</span>,
              isDisabled: removing,
              id: 'read',
            }, {
              label: <span><InlineIcon><FontAwesomeIcon icon={faCopy} /></InlineIcon>duplicate</span>,
              isDisabled: removing,
              id: 'duplicate',
            }, {
              label: <span><InlineIcon><FontAwesomeIcon icon={faTrash} /></InlineIcon>delete</span>,
              isDisabled: removing,
              isColor: 'warning',
              id: 'delete',
            }]}
          bodyContent={
            <Link
              to={`/editor/${props.slideshow.id}`}
            >
            <Columns>
                <Column isSize={'1/4'} className="thumbnail-container" style={{marginRight: '1rem'}}>
                  <img src={thumbnail} style={{width: 'auto', height: 'auto'}} />
                </Column>
                <Column isSize="3/4">
                    <Title>
                    <b>{props.slideshow.name}</b>
                    </Title>
                  <Content>
                    <p className="annotations-container">
                      <span className="annotations-number">
                        {props.slideshow.annotations.size}
                      </span> annotation{props.slideshow.annotations.size === 1 ? '' : 's'}
                    </p>
                  </Content>
                </Column>
              </Columns>
              </Link>
          }>
          <Columns>
            <Column>
              <FormattedMessage {...messages.header} />
            </Column>
          </Columns>
        </Card>
      </Column>
    </Level>
  );
};

export default SlideshowCartouche;
