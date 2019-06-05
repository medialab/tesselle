import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';
import { SupportedShapes } from 'types';
import { PathProps } from 'react-leaflet';

interface AnnotationShapesProps {
  annotation: Annotation<any, any>;
  selected: boolean;
  onClick?: (annotation: Annotation) => any;
  editable?: boolean;
}

type AnnotationShapes = AnnotationShapesProps & PathProps;

export interface AddedProperties {
  editing: boolean;
  original: boolean;
  properties: any;
}
