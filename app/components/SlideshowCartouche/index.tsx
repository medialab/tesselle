/**
 *
 * SlideshowCartouche
 *
 */

import * as React from 'react';
import {
  Button,
  Card,
  Content,
  Level,
  Column,
  Columns,
  Icon,
  Title,
  ModalCard,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';

import { FormattedMessage } from 'react-intl';
import Slideshow from 'types/Slideshow';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useUrl } from 'utils/hooks';
import { push } from 'connected-react-router';
import messages from './messages';

import './style.css';

const InlineIcon = ({ children }) => (
  <span style={{ marginLeft: '.5rem', marginRight: '1rem' }}>
    <Icon isSize="small">{children}</Icon>
  </span>
);

interface OwnProps {
  slideshow: Slideshow;
  onDelete: (toDelete) => void;
  onDuplicate: (toDuplicate: Slideshow) => void;
}

const SlideshowCartouche: React.SFC<OwnProps> = (props: OwnProps) => {
  const dispatch = useDispatch();
  const goToEditor = React.useCallback(() => dispatch(push(`/editor/${props.slideshow.id}`)), [props.slideshow]);
  const goToPlayer = React.useCallback(() => dispatch(push(`/player/${props.slideshow.id}`)), [props.slideshow]);

  const [removing, setRemoving] = React.useState<boolean>(false);
  const [isPendingToDelete, setPendingToDelete] = React.useState<boolean>(false);

  const onRemove = () => {
    setRemoving(true);
    props.onDelete(props.slideshow);
    setPendingToDelete(false);
  };

  const onDeleteCancel = () => {
    setPendingToDelete(false);
  };

  const onAction = React.useCallback(
    (id, event) => {
      switch (id) {
        case 'delete':
          return setPendingToDelete(true);
        case 'open':
          return goToEditor();
        case 'read':
          return goToPlayer();
        case 'duplicate':
            return props.onDuplicate(props.slideshow);
      }
    },
    [props.slideshow],
  );

  const thumbnail = useUrl(props.slideshow.image.file);
  return (
    <Level className="SlideshowCartouche">
      <Column>
        <Card
          onAction={onAction}
          asideActions={[
            {
              label: (
                <span>
                  <InlineIcon>
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </InlineIcon>
                  edit
                </span>
              ),
              isDisabled: removing,
              isColor: 'primary',
              id: 'open',
            },
            {
              label: (
                <span>
                  <InlineIcon>
                    <FontAwesomeIcon icon={faEye} />
                  </InlineIcon>
                  preview
                </span>
              ),
              isDisabled: removing,
              id: 'read',
            },
            {
              label: (
                <span>
                  <InlineIcon>
                    <FontAwesomeIcon icon={faCopy} />
                  </InlineIcon>
                  duplicate
                </span>
              ),
              isDisabled: removing,
              id: 'duplicate',
            },
            {
              label: (
                <span>
                  <InlineIcon>
                    <FontAwesomeIcon icon={faTrash} />
                  </InlineIcon>
                  delete
                </span>
              ),
              isDisabled: removing,
              isColor: 'warning',
              id: 'delete',
            },
          ]}
          bodyContent={
            <Link to={`/editor/${props.slideshow.id}`}>
              <Columns>
                <Column
                  isSize={'1/4'}
                  className="thumbnail-container"
                  style={{ marginRight: '1rem' }}
                  >
                  <img
                    src={thumbnail}
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </Column>
                <Column isSize="3/4">
                  <Title>
                    <b>{props.slideshow.name}</b>
                  </Title>
                  <Content>
                    <p className="annotations-container">
                      <span className="annotations-number">
                        {props.slideshow.annotations.size}
                      </span>{' '}
                      annotation
                      {props.slideshow.annotations.size === 1 ? '' : 's'}
                    </p>
                  </Content>
                </Column>
              </Columns>
            </Link>
          }
        >
          <Columns>
            <Column>
              <FormattedMessage {...messages.header} />
            </Column>
          </Columns>
        </Card>
      </Column>
      <ModalCard
        isActive={isPendingToDelete}
        onClose={onDeleteCancel}
        headerContent="Deleting a slideshow"
        mainContent="Are you sure you want to delete this document ?"
        footerContent={[
        <StretchedLayoutContainer
            style={{ width: '100%' }}
            isDirection="horizontal"
            key={0}
          >
            <StretchedLayoutItem isFlex={1}>
              <Button isFullWidth onClick={onRemove} isColor="danger">
                Delete
              </Button>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={1}>
              <Button isFullWidth onClick={onDeleteCancel} isColor="warning">
                Cancel
              </Button>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>,
        ]
      }
      />
    </Level>
  );
};

export default SlideshowCartouche;
