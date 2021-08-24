import React from 'react';
import App from '../../components/App';
import { render } from './testUtils';
import { mockSheet }  from '../../__data__/mockSheet_FilterOptions';

export const setupApp = () => {
    const renderObj = render(<App />, { preloadedState: mockSheet });
    const { container } = renderObj;
    return {
        ...renderObj,
        container
    }
}