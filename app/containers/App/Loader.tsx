import * as React from 'react';
import { useSlicerState } from './hooks';

function Loader() {
  const slicer = useSlicerState();
  if (slicer && slicer.total === 0) {
    return <React.Fragment />;
  }
  return (
    <div>
      <progress
        className="progress is-primary"
        value={`${(slicer.present / slicer.total) * 100}`}
        max="100">{Math.floor(slicer.present / slicer.total) * 100}</progress>
    </div>
  );
}

export default Loader;
