import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';
import { SupportedShapes } from 'types';
import { PathProps } from 'react-leaflet';

interface AnnotationShapesProps {
  annotation: Annotation;
  selected: boolean;
  onClick?: (annotation: Annotation) => any;
  editable?: boolean;
}

type AnnotationShapes = AnnotationShapesProps & PathProps;
