import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';

import { store } from './_helpers';
import { App } from './App/App';
import 'antd/dist/antd.css';
import registerServiceWorker from './registerServiceWorker';

// setup fake backend
//import { configureFakeBackend } from './_helpers';
//configureFakeBackend();

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
