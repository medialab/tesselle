import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';

interface AnnotationShapes {
  annotation: Annotation;
  onEdit: (annotation: Annotation, layer: Layer) => any;
}
