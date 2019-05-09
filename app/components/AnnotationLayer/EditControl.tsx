import 'leaflet-draw'; // eslint-disable-line
import isEqual from 'lodash-es/isEqual';
import L, { Control } from 'leaflet';

import { MapControl, withLeaflet, MapControlProps } from 'react-leaflet';

const eventHandlers = {
  onEdited: 'draw:edited',
  onDrawStart: 'draw:drawstart',
  onDrawStop: 'draw:drawstop',
  onDrawVertex: 'draw:drawvertex',
  onEditStart: 'draw:editstart',
  onEditMove: 'draw:editmove',
  onEditResize: 'draw:editresize',
  onEditVertex: 'draw:editvertex',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop',
};

interface DrawProps {
  polyline?: object | boolean;
  polygon?: object | boolean;
  rectangle?: object | boolean;
  circle?: object | boolean;
  marker?: object | boolean;
  circlemarker?: object | boolean;
}

interface EditProps {
  edit?: object | boolean;
  remove?: object | boolean;
  poly?: object | boolean;
  allowIntersection?: object | boolean;
}

interface EditControlProps {
  onMounted?: (arg?: any) => any;
  onEdited?: (arg?: any) => any;
  onCreated?: (arg?: any) => any;
  onDeleted?: (arg?: any) => any;
  onEditStart?: (arg?: any) => any;
  onEditStop?: (arg?: any) => any;
  onDeleteStart?: (arg?: any) => any;
  onDeleteStop?: (arg?: any) => any;
  onDrawStart?: (arg?: any) => any;
  onDrawStop?: (arg?: any) => any;
  onDrawVertex?: (arg?: any) => any;
  onEditMove?: (arg?: any) => any;
  onEditResize?: (arg?: any) => any;
  onEditVertex?: (arg: any) => any;
  edit?: EditProps;
  draw: DrawProps;
  position: string;
}

class EditControl extends MapControl<EditControlProps & MapControlProps> {

  public createLeafletElement(props) {
    return createDrawElement(props);
  }

  private onDrawCreate = (e) => {
    const { onCreated } = this.props;
    if (onCreated) {
      if (this.props.leaflet) {
        const { layerContainer } = this.props.leaflet;
        if (layerContainer) {
          onCreated(e);
        }
      }
    }
  };

  public componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }
    if (this.props.leaflet) {
      const { map } = this.props.leaflet;
      const { onMounted } = this.props;
      if (map) {
        for (const key in eventHandlers) {
          if (this.props[key]) {
            map.on(eventHandlers[key], this.props[key]);
          }
        }

        map.on(L.Draw.Event.CREATED, this.onDrawCreate);

        if (onMounted) {
          onMounted(this.props.leaflet.layerContainer);
        }
      }
    }
  }

  public componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }
    if (this.props.leaflet) {
      const { map } = this.props.leaflet;
      if (map) {
        map.off(L.Draw.Event.CREATED, this.onDrawCreate);

        for (const key in eventHandlers) {
          if (this.props[key]) {
            map.off(eventHandlers[key], this.props[key]);
          }
        }
      }
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (super.componentDidUpdate) {
      super.componentDidUpdate(prevProps, prevState);
    }

    if (this.props.leaflet && this.props.leaflet.map) {
      for (const key in eventHandlers) {
        if (prevProps[key] !== this.props[key]) {
          this.props.leaflet.map.off(eventHandlers[key], prevProps[key]);
          this.props.leaflet.map.on(eventHandlers[key], this.props[key]);
        }
      }

      if (isEqual(this.props.draw, prevProps.draw) || this.props.position !== prevProps.position) {
        return false;
      }
      this.leafletElement.remove();
      this.leafletElement = createDrawElement(this.props);
      this.leafletElement.addTo(this.props.leaflet.map);
    }

    return null;
  }
}

function createDrawElement(props) {
  const { layerContainer } = props.leaflet;
  const { draw, edit, position } = props;
  const options: any = {
    edit: {
      ...edit,
      featureGroup: layerContainer,
    },
  };

  if (draw) {
    options.draw = { ...draw };
  }

  if (position) {
    options.position = position;
  }

  return new Control.Draw(options);
}

export default withLeaflet(EditControl);
