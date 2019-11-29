import * as React from 'react';
import { useSlicerState } from './hooks';

const Progress = (props: {
  value: number,
  max?: number,
  children?: any,
}) => {
  const {
    value,
  } = props;
  return (
    <div className="progress-bar progress is-primary">
      <div className="progress-value" style={{transform: `translate(${value - 100}%)`}} />
    </div>
  );
};

function Loader() {
  const slicer = useSlicerState();
  if (slicer && slicer.total === 0) {
    return <React.Fragment />;
  }
  const percent = (slicer.present / slicer.total) * 100;
  return (
    <div>
      <Progress
        value={percent}
        max={100}>{Math.floor(percent)}</Progress>
    </div>
  );
}

export default Loader;
