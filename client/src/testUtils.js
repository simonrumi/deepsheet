import React from 'react';
import { render as rtlRender } from '@testing-library/react';
// import { configureStore } from '@reduxjs/toolkit'; // FYI this was the original version, but we want to use our own managedStore
import { Provider } from 'react-redux';
import managedStore from './store';

const getStore = () => {
    managedStore.init();
    return managedStore.store;
}

const render = (
    ui,
    {
        preloadedState,
        // store = configureStore({ reducer:  staticReducers, preloadedState }), // FYI this was the original version, but we want to use our own managedStore
        store = getStore(),
        ...renderOptions
    } = {}
) => {
    const Wrapper = ({ children }) => <Provider store={store} >{ children }</Provider>;
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };

// see https://redux.js.org/usage/writing-tests
