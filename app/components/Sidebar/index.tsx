/**
 *
 * Sidebar
 *
 */

import * as React from 'react';
import { List } from 'immutable';
import { Button, Box, StretchedLayoutContainer, StretchedLayoutItem, Icon } from 'quinoa-design-library';
import { useDispatch } from 'utils/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Formik, Field, Form, FormikValues, FormikErrors } from 'formik';
import cx from 'classnames';

import {
  removeAnnotationAction,
  editOrderAction,
  changeSelectionAction,
  editAnnotationAction,
} from 'containers/Editor/actions';
import Annotation from 'types/Annotation';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import './styles.css';

interface MenuItemProps {
  data: Annotation;
  selected: boolean;
  refMdr;
  draggableProps;
  dragHandleProps;
}

const validator = (values: FormikValues) => {
  const errors: FormikErrors<any> = {};
  if (!values.content && !values.content.length) {
    errors.content = 'Required';
  }
  return errors;
};

const MenuItem: any = React.forwardRef<any, any>((props: MenuItemProps) => {
  const dispatch = useDispatch();
  const onRemove = React.useCallback(
    () => dispatch(removeAnnotationAction(props.data)),
    [props.data],
  );
  const changeSelection = React.useCallback(() => {
    dispatch(changeSelectionAction(props.data));
  }, [props.data]);
  const onSubmit = React.useCallback((values) => {
    console.log('on submit');
    if (values.content !== props.data.properties.content) {
      dispatch(editAnnotationAction(props.data, {
        properties: {
          content: values.content,
          radius: props.data.properties.radius,
        },
      }));
    }
  }, [props.data]);
  return (
    <div ref={props.refMdr} {...props.draggableProps}>
      <Box style={{background: props.selected ? '#3849a2' : 'transparent'}}>
        <StretchedLayoutContainer isDirection="horizontal">
          <StretchedLayoutItem
            style={{
              paddingRight: '1rem',
            }}
            isFlex={1}>
            <Formik
              initialValues={props.data.properties}
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
                    onBlur={onBlur}
                    onFocus={changeSelection}
                    className={cx('textarea', 'sidebar--item-field', props.selected && 'sidebar--item-field--selected')}
                    component="textarea"
                    name="content"
                  />
                </Form>
              );
            }}
            </Formik>
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <StretchedLayoutContainer isDirection="vertical">
              <Button
                onClick={onRemove}
                style={{marginBottom: '.5rem'}}
                data-for="card-action" data-tip={'delete this annotation'}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>
              <div {...props.dragHandleProps}>
                <div
                  className="button  is-lock-status-open"
                  style={{marginBottom: '.5rem'}}
                  data-for="card-action"
                  data-tip={'drag to change annotation order'}
                >
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </div>
              </div>
              <Button data-for="card-action" data-tip={'set a frame'}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.cover.black.svg} />
                </Icon>
              </Button>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Box>
    </div>
  );
});

interface OwnProps {
  annotations: List<Annotation>;
  selectedAnnotation: Annotation;
}

const reorder = (list: List<Annotation>, startIndex: number, endIndex: number) => {
  const removed = list.get(startIndex);
  if (removed) {
    return list.splice(startIndex, 1).splice(endIndex, 0, removed);
  }
  return list;
};

const Orderable: React.SFC<OwnProps> = (props: OwnProps) => {

  const dispatch = useDispatch();

  const onDragEnd = React.useCallback((result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(
      editOrderAction(
        reorder(
          props.annotations,
          result.source.index,
          result.destination.index,
        ),
      ),
    );
  }, [props.annotations]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}>
            {props.annotations.map((feature, index) => (
              <Draggable key={feature.properties.id} draggableId={feature.properties.id} index={index}>
                {(provided) => (
                  <div
                  ><MenuItem
                    refMdr={provided.innerRef}
                    draggableProps={provided.draggableProps}
                    dragHandleProps={provided.dragHandleProps}
                    data={feature}
                    selected={feature === props.selectedAnnotation} />
                  </div>
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

const Sidebar: React.SFC<OwnProps> = (props: OwnProps) => {
  if (!props.annotations) {
    return (
      <div className="sidebar">
        <h1>Select a slide</h1>
      </div>
    );
  }
  if (props.annotations.size === 0) {
    return (
      <div className="sidebar">
        <h1>Edit your annotations here.</h1>
      </div>
    );
  }

  return <div className="sidebar"><Orderable {...props} /></div>;
};

export default Sidebar;
