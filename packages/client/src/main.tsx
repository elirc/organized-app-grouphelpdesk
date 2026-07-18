// Author: Sam Rivera
// Issue: #6 â€” Mount the React application

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
