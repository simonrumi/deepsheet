import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

// thunk is used when reducers need to make async calls, because redux normally dispatches actions
// immediately. with thunk you can do the dispatch when you're ready
import reduxThunk from 'redux-thunk';
import reducers from './reducers';
import App from './components/App';

// original version, without using redux  dev tools
// the middle object is an intial state
// const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

// this makes use of Redux Dev Tools extension for Chrome
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, /* preloadedState, */ composeEnhancers(applyMiddleware(reduxThunk)));

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#root')
);
