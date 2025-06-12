import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './sass/index.css';
import App from './js/containers/App';
import registerServiceWorker from './js/registerServiceWorker';

import configureStore from './js/store/configureStore';

const store = configureStore();

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);


registerServiceWorker();
