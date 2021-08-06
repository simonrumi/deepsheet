import React from 'react';
import App from '../../components/App';
import { render, fireEvent } from '../../testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import mockSheet from '../../__data__/mockSheet_FilterOptions';
import * as userHelpers from '../../helpers/userHelpers';

describe('App', () => {
    const setup = () => {
        const renderObj = render(<App />, { preloadedState: mockSheet });
        const { container } = renderObj;
        return {
            ...renderObj,
            container
        }
    }

    // TODO NEXT update Jest to version 27 ...probably the reason things are not working

    jest.mock('../../helpers/userHelpers');
    // userHelpers.getUserInfoFromCookie.mockResolvedValue({ userId: '123ABC', sessionId: '456DEF' });
    console.log(
       'App.test userHelpers',
       userHelpers,
       'typeof userHelpers.getUserInfoFromCookie',
       typeof userHelpers.getUserInfoFromCookie
    );
    console.log('App.test got userHelpers.getUserInfoFromCookie()', userHelpers.getUserInfoFromCookie());

    // TODO NEXT this is getting closer, but still getUserInfoFromCookie is not actually being mocked
    // let mockGetUserInfoFromCookie;
    beforeAll(() => {
        console.log('******* App.test start ***********');
        // const spy = jest.spyOn({ getUserInfoFromCookie }, 'getUserInfoFromCookie');
        // mockGetUserInfoFromCookie = spy.mockImplemetation(() => ({ userId: '123ABC', sessionId: '456DEF' }));
        /* jest.mock('../../helpers/userHelpers', () => {
            return {
                __esModule: true,
                getUserInfoFromCookie: () => ({ userId: '123ABC', sessionId: '456DEF' })
            }
        }); */
    });
    
    afterAll(() => {
        // mockGetUserInfoFromCookie.mockRestore();
        console.log('********** end of App.test **********');
    });
    

    test('it calls getUserInfoFromCookie', () => {
        const { unmount } = setup();
        expect(userHelpers.getUserInfoFromCookie()).toEqual({ userId: '123ABC', sessionId: '456DEF' });
        unmount();
    });

    test('it renders and displays the something', () => {
        const { unmount, queryAllByText } = setup();
        expect(queryAllByText(/A/i)).not.toHaveLength(0);
        unmount();
    });

    test.skip('it renders the gear icon for row index 4', () => {
        const { unmount, container } = setup();
        const rowHeader4 = container.querySelector('#rowHeader_4');
        console.log('App.test got rowHeader4', rowHeader4);
        expect(rowHeader4).not.toBeNull();
        // TODO - why can't we find rowHeader4 ?
    })

});