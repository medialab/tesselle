/**
 *
 * Sidebar
 *
 */

import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { List } from 'immutable';
import {
  Button,
  Box,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Icon,
  Title as SimpleTitle,
} from 'quinoa-design-library';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Formik, Form, FormikValues, FormikErrors, Field, FormikActions, FieldProps } from 'formik';
import cx from 'classnames';
import Textarea from 'react-textarea-autosize';
import Tooltip from 'react-tooltip';
import { DomEvent } from 'leaflet';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';

import Annotation from 'types/Annotation';
import Slideshow from 'types/Slideshow';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import './styles.css';
import Loader from 'containers/Slicer';
import Download from 'components/Download';
import messages from './messages';
import DownloadModalHelp from '../DownloadModalHelp';

import logo from '../../images/logo.svg';

const CustomTextarea: React.SFC<FieldProps & {
  readonly selected: boolean;
}> = ({field, form: {touched, errors}, ...props}) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    if (props.selected) {
      ref.current.focus();
    }
  }, [props.selected]);
  return (
    <div>
      <FormattedMessage {...messages.annotationPlaceholder}>{
        msg => (
          <>
            <Textarea inputRef={ref} autoFocus={props.selected} {...field} {...props} placeholder={msg as string} />
            {touched[field.name] &&
              errors[field.name] && <div className="error">{errors[field.name]}</div>}
          </>
        )
      }</FormattedMessage>
    </div>
  );
};

const validator = (values: FormikValues) => {
  const errors: FormikErrors<any> = {};
  if (!values.content && !values.content.length) {
    // errors.content = 'Required';
  }
  return errors;
};

interface MenuItemProps {
  data: Annotation;
  selected: boolean;
  minified?: boolean;
  onRemove: (annotation: Annotation) => void;
  onClick: (annotation: Annotation) => void;
  onChange: (oldAnnotation: Annotation, newAnnotation: Annotation) => void;
  draggableProps?;
  dragHandleProps?;
}

const MenuItem = React.forwardRef<any, MenuItemProps>((props, forwardedRef) => {
  const onClick = React.useCallback((event) => {
    event.stopPropagation();
    props.onClick(props.data);
  }, [props.onClick, props.data]);

  const onSubmit = useCallback((values) => {
    if (values.content !== props.data.properties.content) {
      props.onChange(
        props.data,
        props.data.set(
          'properties',
          props.data.properties.set('content', values.content),
        ),
      );
    }
  }, [props.data, props.onChange]);

  const onRemove = useCallback(event => {
    DomEvent.preventDefault(event);
    props.onRemove(props.data);
  }, [props.data, props.onRemove]);

  const ContainerEl = props.minified ? React.Fragment : Box;
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
      'sidebar--menu-item__minified': props.minified,
    })} ref={forwardedRef} {...props.draggableProps} onClick={onClick}>
      <ContainerEl>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem
            style={{
              paddingRight: '1rem',
            }}
            isFlex={1}>
            <Formik
              initialValues={useMemo(() => props.data.properties.toJS(), [props.data.properties])}
              enableReinitialize={true}
              onSubmit={onSubmit}
              validate={validator}
            >{(innerProps) => {
              const onBlur = (event) => {
                innerProps.handleBlur(event);
                innerProps.submitForm();
              };
              return (
                <Form>
                  <Field
                    minRows={1}
                    maxRows={5}
                    selected={props.selected}
                    onBlur={onBlur}
                    className={cx('textarea', 'sidebar--item-field', {
                      'sidebar--item-field--selected': props.selected,
                      'sidebar--item-field--minified': props.minified ,
                    })}
                    name="content"
                    component={CustomTextarea}
                  />
                </Form>
              );
            }}
            </Formik>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <StretchedLayoutContainer isDirection="horizontal">
              <Button
                onClick={onRemove}
                style={{marginBottom: '.5rem'}}
                data-for="card-action" data-tip={'delete this annotation'}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>
              {props.dragHandleProps && <div {...props.dragHandleProps}>
                <div
                  className="button is-lock-status-open"
                  style={{marginBottom: '.5rem'}}
                  data-for="card-action"
                  data-tip={'drag to change annotation order'}
                >
                  <Icon isSize="small" isAlign="left">
                    <img src={icons.move.black.svg} />
                  </Icon>
                </div>
              </div>}
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </ContainerEl>
    </div>
  );
});

const reorder = (list: List<Annotation>, startIndex: number, endIndex: number) => {
  const removed = list.get(startIndex);
  if (removed) {
    return list.splice(startIndex, 1).splice(endIndex, 0, removed);
  }
  return list;
};

interface ListProps {
  slideshow: Slideshow;
  onRemove: (annotation: Annotation) => void;
  onAnnotationClick: (annotation?: Annotation) => void;
  selectedAnnotations: List<Annotation>;
  onAnnotationChange: (oldAnnotation: Annotation, newAnnotation: Annotation) => void;
  onOrderChange: (newOrder: List<Annotation>) => void;
}

const Orderable: React.SFC<ListProps> = props => {
  const onDragEnd = useCallback((result) => {
    if (!result.destination) {
      return;
    }
    props.onOrderChange(
      reorder(
        props.slideshow.annotations,
        result.source.index,
        result.destination.index,
      ),
    );
  }, [props.slideshow.annotations]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}>
            {props.slideshow.annotations.map((annotation, index) => (
              <Draggable key={annotation.properties.id} draggableId={annotation.properties.id} index={index}>
                {(provided) => (
                  <MenuItem
                    onChange={props.onAnnotationChange}
                    onClick={props.onAnnotationClick}
                    onRemove={props.onRemove}
                    ref={provided.innerRef}
                    draggableProps={provided.draggableProps}
                    dragHandleProps={provided.dragHandleProps}
                    data={annotation}
                    selected={props.selectedAnnotations.includes(annotation)} />
                )}
                </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const Header: React.SFC<{
  onButtonClick: () => void;
  readonly visible: boolean;
  slideshow: Slideshow;
  onNameChange: (values: TitleProps, formikActions: FormikActions<TitleProps>) => void;
}> = (props) => (
  <div className="sidebar--header-container sidebar--spacing">
    <SimpleTitle
      isSize={5}
    >
      <Link to="/">
        <img data-tip="Back to home" data-for="tooltip" src={logo} style={{maxWidth: '2rem'}} />
      </Link>
    </SimpleTitle>
    {props.visible ?
      <Title title={props.slideshow.name} onChange={props.onNameChange} />
      :
      <SimpleTitle isSize={6} className="is-stretch">{props.slideshow.name}</SimpleTitle>
    }
    <Button isRounded className="minify-toggle" onClick={props.onButtonClick}>
        <Icon>
          { props.visible ?
            <FontAwesomeIcon icon={faMinus} />
            :
            <FontAwesomeIcon icon={faPlus} />
          }
        </Icon>
    </Button>
  </div>
);

interface TitleProps {
  title: string;
  onChange: (values: TitleProps, formikActions: FormikActions<TitleProps>) => void;
}

const Title: React.SFC<TitleProps> = (props) => {
  return (
    <Formik
      initialValues={props}
      onSubmit={props.onChange}
    >{(innerProps) => {
      const onBlur = (event) => {
        innerProps.handleBlur(event);
        innerProps.submitForm();
      };
      return (
        <Form>
          <Field
            className="input__invisible input"
            onBlur={onBlur}
            name="title"
            data-for="tooltip"
            data-tip="document title"
            data-place="bottom"
            placeholder="document title"
          />
        </Form>
      );
    }}
    </Formik>
  );
};

interface SidebarProps extends ListProps {
  visible: boolean;
  onNameChange: (slideshow: Slideshow) => void;
  onClose: () => void;
  onOpen: () => void;
}

const Sidebar: React.SFC<SidebarProps> = props => {
  const onClickSidebar = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    return props.onAnnotationClick();
  }, []);
  const onNameChange = useCallback(
    values => props.onNameChange(props.slideshow.set('name', values.title)),
    [props.slideshow],
  );
  const selected = props.selectedAnnotations.first<Annotation>();
  const [isDownloadModalHelp, setDownloadModalHelp] = useState(false);
  const onCloseDownloadModalHelp = () => setDownloadModalHelp(false);
  const onOpenDownloadModalHelp = () => setDownloadModalHelp(true);
  return (
    <div className={cx({sidebar: true, visible: props.visible, hidden: !props.visible})}>
      <Header
        onButtonClick={props.visible ? props.onClose : props.onOpen}
          visible={props.visible}
          onNameChange={onNameChange}
        slideshow={props.slideshow}
      />
      <div className="sidebar--wrapper">
        <Loader />
        <div onClick={onClickSidebar} className="sidebar--container">
          {props.visible ? (
            <Orderable {...props} />
          ) : selected ? (
            <MenuItem
              onChange={props.onAnnotationChange}
              onClick={props.onAnnotationClick}
              onRemove={props.onRemove}
              data={selected as Annotation}
              selected={!!selected}
              minified={props.visible !== undefined}
            />
            ) : (
              <span className="sidebar--minified-placeholder">select or create an annotation</span>
            )
          }
        </div>
      </div>
      <footer className="sidebar--footer-container sidebar--spacing">
        <StretchedLayoutContainer isDirection="horizontal" style={{width: '100%'}}>
          <StretchedLayoutItem isFlex={1}>
            <Link to={`/player/${props.slideshow.id}`} className="button is-fullwidth is-primary">Preview</Link>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={1}>
            <StretchedLayoutContainer isDirection="horizontal">
              <StretchedLayoutItem isFlex={1}>
                <Download disabled={!props.slideshow.annotations.size} />
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Button onClick={onOpenDownloadModalHelp} isColor="info">?</Button>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </footer>
      <DownloadModalHelp isOpen={isDownloadModalHelp} onRequestClose={onCloseDownloadModalHelp} />
      <Tooltip id="tooltip" place="right" effect="solid" />
    </div>
  );
};

export default Sidebar;
