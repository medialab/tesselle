/**
 *
 * Loader
 *
 */

import * as React from 'react';

import logo from './assets/logo.svg';

import './style.css';

// import styled from 'styles/styled-components';


const Loader: React.SFC<{}> = (props: {}) => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <h1 className="title is-1 loader-title-container">
          <img className="spinner" src={logo} />
          <span className="app-name">Tesselle</span>
        </h1>
        <h2 className="title is-3">Loading</h2>

      </div>
    </div>
  );
};

export default Loader;
