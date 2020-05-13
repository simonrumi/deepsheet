import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import apolloClient from './apolloClient';
import managedStore from './store';
import './css/tailwind.css';
import App from './components/App';

managedStore.init();

ReactDOM.render(
   <Provider store={managedStore.store}>
      <ApolloProvider client={apolloClient}>
         <App />
      </ApolloProvider>
   </Provider>,
   document.querySelector('#root')
);
