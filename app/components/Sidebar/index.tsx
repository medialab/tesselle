/**
 *
 * Sidebar
 *
 */

import * as React from 'react';
import { Set } from 'immutable';
import './styles.css';
import Annotation from 'types/Annotation';

function MenuItem(props) {
  return (
    <h1>Menu Item</h1>
  );
}

interface OwnProps {
  annotations: Set<Annotation>;
}

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
  return (
    <div className="sidebar">
      {props.annotations.map((feature, index) => <MenuItem key={index} data={feature} />)}
    </div>
  );
};

export default Sidebar;
