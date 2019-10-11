import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import managedStore from './store';
import App from './components/App';

managedStore.init();

ReactDOM.render(
   <Provider store={managedStore.store}>
      <App />
   </Provider>,
   document.querySelector('#root')
);
