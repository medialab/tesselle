/**
 *
 * Sidebar
 *
 */

import React, { useCallback, useMemo } from 'react';
import { List } from 'immutable';
import { Button, Box, StretchedLayoutContainer, StretchedLayoutItem, Icon } from 'quinoa-design-library';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Formik, Form, FormikValues, FormikErrors, Field, FormikActions, FieldProps } from 'formik';
import cx from 'classnames';
import Textarea from 'react-textarea-autosize';

import Annotation from 'types/Annotation';
import Slideshow from 'types/Slideshow';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import './styles.css';
import { DomEvent } from 'leaflet';
import { Link } from 'react-router-dom';
import Loader from 'containers/Slicer';

const CustomTextarea: React.SFC<FieldProps> = ({field, form: {touched, errors}, ...props}) => (
  <div>
    <Textarea {...field} {...props} />
    {touched[field.name] &&
      errors[field.name] && <div className="error">{errors[field.name]}</div>}
  </div>
);

const validator = (values: FormikValues) => {
  const errors: FormikErrors<any> = {};
  if (!values.content && !values.content.length) {
    errors.content = 'Required';
  }
  return errors;
};

interface MenuItemProps {
  data: Annotation;
  selected: boolean;
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

  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
    })} ref={forwardedRef} {...props.draggableProps} onClick={onClick}>
      <Box>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem
            style={{
              paddingRight: '1rem',
            }}
            isFlex={1}>
            <Formik
              initialValues={useMemo(() => props.data.properties.toJS(), [props.data.properties])}
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
                    onBlur={onBlur}
                    className={cx('textarea', 'sidebar--item-field', props.selected && 'sidebar--item-field--selected')}
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
      </Box>
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
  }, []);

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
}> = (props) => (
  <div className="sidebar--header-container sidebar--spacing">
    <div><Link to="/">Glissevoit</Link></div>
    <span onClick={props.onButtonClick}>
      <Icon>
        <img src={icons.preview.white.svg} />
      </Icon>
    </span>
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
            className="input__invisible"
            onBlur={onBlur}
            name="title"
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
  const onClickToggle = React.useCallback(
    props.visible ? props.onClose : props.onOpen,
    [props.visible],
  );
  const onNameChange = useCallback(values => props.onNameChange(props.slideshow.set('name', values.title)), []);
  const selected = props.selectedAnnotations.first();

  return (
    <div className={cx({sidebar: true, visible: props.visible, hidden: !props.visible})}>
      <Header onButtonClick={onClickToggle} />
      <Title title={props.slideshow.name} onChange={onNameChange} />
      <Loader />
      <div onClick={onClickSidebar} className="sidebar--container">
        {props.visible ? (
          <Orderable {...props} />
        ) : selected && (
          <MenuItem
            onChange={props.onAnnotationChange}
            onClick={props.onAnnotationClick}
            onRemove={props.onRemove}
            data={selected as Annotation}
            selected={!!selected} />
          )
        }
      </div>
      <footer className="sidebar--footer-container sidebar--spacing">
        <Link to={`/player/${props.slideshow.id}`} className="button">Viewer</Link>
        <div className="buttons has-addons">
          <Button disabled={!props.slideshow.annotations.size} >Download ↓</Button>
          <Button>?</Button>
        </div>
      </footer>
    </div>
  );
};

export default Sidebar;
