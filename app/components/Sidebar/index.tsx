/**
 *
 * Sidebar
 *
 */

import React from 'react';
import { List } from 'immutable';
import { Button, Box, StretchedLayoutContainer, StretchedLayoutItem, Icon } from 'quinoa-design-library';
import { useDispatch } from 'utils/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Formik, Form, FormikValues, FormikErrors, Field, FormikActions } from 'formik';
import cx from 'classnames';
import Textarea from 'react-textarea-autosize';

const CustomTextarea = ({field, form: {touched, errors}, ...props}: any) => (
  <div>
    <Textarea {...field} {...props} />
    {touched[field.name] &&
      errors[field.name] && <div className="error">{errors[field.name]}</div>}
  </div>
);

import {
  removeAnnotationAction,
  editOrderAction,
  changeSelectionAction,
  editAnnotationAction,
} from 'containers/Editor/actions';
import Annotation from 'types/Annotation';
import Slideshow from 'types/Slideshow';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import './styles.css';
import { DomEvent } from 'leaflet';
import { Link } from 'react-router-dom';

interface MenuItemProps {
  data: Annotation;
  selected: boolean;
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

const MenuItem: any = React.forwardRef<any, any>((props: MenuItemProps, forwardedRef) => {
  const dispatch = useDispatch();
  const onRemove = React.useCallback(
    (event) => {
      DomEvent.stopPropagation(event);
      return dispatch(removeAnnotationAction(props.data));
    },
    [props.data],
  );
  const changeSelection = React.useCallback((event) => {
    event.stopPropagation();
    if (!props.selected) {
      dispatch(changeSelectionAction(props.data));
    }
  }, [props.data, props.selected]);
  const onSubmit = React.useCallback((values) => {
    if (values.content !== props.data.properties.content) {
      dispatch(
        editAnnotationAction(
          props.data,
          props.data.set(
            'properties',
            props.data.properties.set('content', values.content),
          ),
        ),
      );
    }
  }, [props.data]);
  return (
    <div className={cx({
      'sidebar--menu-item sidebar--spacing': true,
      'sidebar--menu-item__selected': props.selected,
    })} ref={forwardedRef} {...props.draggableProps} onClick={changeSelection}>
      <Box>
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
              <div {...props.dragHandleProps}>
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
              </div>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Box>
    </div>
  );
});

interface OwnProps {
  slideshow: Slideshow;
  selectedAnnotations: List<Annotation>;
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const reorder = (list: List<Annotation>, startIndex: number, endIndex: number) => {
  const removed = list.get(startIndex);
  if (removed) {
    return list.splice(startIndex, 1).splice(endIndex, 0, removed);
  }
  return list;
};

interface OrderableProps {
  annotations: List<Annotation>;
  selectedAnnotations: List<Annotation>;
}

const Orderable: React.SFC<OrderableProps> = props => {
  const dispatch = useDispatch();
  const onDragEnd = React.useCallback((result) => {
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
            {props.annotations.map((annotation, index) => (
              <Draggable key={annotation.properties.id} draggableId={annotation.properties.id} index={index}>
                {(provided) => (
                  <MenuItem
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

const Header: React.SFC<any> = () => <div><Link to="/">Glissevoit</Link></div>;

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
            minRows={1}
            maxRows={5}
            onBlur={onBlur}
            name="title"
          />
        </Form>
      );
    }}
    </Formik>
  );
  // const [editing, setEditing] = useState<boolean>(false);
  return (
    <div>
      {props.title}
    </div>
  );
};

const Sidebar: React.SFC<OwnProps> = props => {
  const dispatch = useDispatch();
  const onClickSidebar = React.useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    dispatch(changeSelectionAction());
  }, []);
  const onClickToggle = React.useCallback(
    props.visible ? props.onClose : props.onOpen,
    [props.visible],
  );
  return (
    <div className={cx({sidebar: true, visible: props.visible, hidden: !props.visible})}>
      <div className="sidebar--header-container sidebar--spacing">
        <Header />
        <span onClick={onClickToggle}>
          <Icon>
            <img src={icons.preview.white.svg} />
          </Icon>
        </span>
      </div>
      <Title title={props.slideshow.id} onChange={console.log} />
      <div onClick={onClickSidebar} className="sidebar--container">
        {props.slideshow.annotations.size > 0 ?
          <Orderable
            {...props}
            annotations={props.visible ?
              props.slideshow.annotations
              : props.selectedAnnotations.size !== 0 ? props.selectedAnnotations : List([])
            }
          /> :
          <h1>Edit your annotations here.</h1>
        }
      </div>
      <div className="sidebar--footer-container sidebar--spacing">
        <footer>
          <div className="buttons has-addons">
            <Button disabled={!props.slideshow.annotations.size} >Download ↓</Button>
            <Button>?</Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Sidebar;
