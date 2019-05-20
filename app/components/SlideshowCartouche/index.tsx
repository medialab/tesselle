/**
 *
 * SlideshowCartouche
 *
 */

import * as React from 'react';
import { Card, Content, Level, Column, Columns, Icon } from 'quinoa-design-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Slideshow from 'types/Slideshow';
import { Link } from 'react-router-dom';
import { useAction } from 'utils/hooks';
import { push } from 'connected-react-router';

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

  const goTo = useAction(() => push(`/editor/${props.slideshow.id}`), []);
  const [removing, setRemoving] = React.useState<boolean>(false);

  const onAction = React.useCallback((id, event) => {
    switch (id) {
      case 'delete':
        setRemoving(true);
        return props.onDelete(props.slideshow);
      case 'open':
        return goTo();
    }
  }, [props.slideshow]);
  return (
    <Level>
      <Column>
        <Card
          onAction={onAction}
          title={
            <Columns>
              <Column isSize="3/4">
                <Link
                  to={`/editor/${props.slideshow.id}`}
                >
                  <b>{props.slideshow.name}</b>
                </Link>
              </Column>
              <Column isSize="1/4" />
            </Columns>
          }
        asideActions={[{
            label: <span><InlineIcon><FontAwesomeIcon icon={faPencilAlt} /></InlineIcon>edit</span>,
            isDisabled: removing,
            isColor: 'primary',
            id: 'open',
          }, {
            label: <span><InlineIcon><FontAwesomeIcon icon={faCopy} /></InlineIcon>duplicate</span>,
            isDisabled: removing,
            id: 'read',
          }, {
            label: <span><InlineIcon><FontAwesomeIcon icon={faTrash} /></InlineIcon>delete</span>,
            isDisabled: removing,
            isColor: 'warning',
            id: 'delete',
          }]}
        bodyContent={
          <Content>
            <p>Has {props.slideshow.annotations.size} annotations.</p>
          </Content>
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
