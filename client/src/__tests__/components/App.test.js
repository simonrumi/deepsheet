import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { mockDb } from '../../__data__/mockDb';
import { decodeText, createCellId } from '../../helpers/cellHelpers';
import { setupApp } from '../testHelpers';

// Notes on jest mock:
// jest.mock is hoisted above the import statements, in order for it to affect the imports
// if you put jest.mock inside a block, then the hoising can't happen and everything breaks
// it is possible to use require instead of import that can get around this...somehow....
// See the answer and comments on the answer here
// https://stackoverflow.com/questions/49694366/manual-mock-not-working-in-with-jest
jest.mock('../../helpers/userHelpers', () => ({
    __esModule: true,
    ...jest.requireActual('../../helpers/userHelpers'),
    getUserInfoFromCookie: jest.fn().mockReturnValue({ userId: '123ABC', sessionId: '456DEF' })
}));

jest.mock('../../services/sheetServices', () => ({
    __esModule: true,
    ...jest.requireActual('../../services/sheetServices'),
    fetchSheet: () => mockDb, // for whatever reason this didn't work, although it worked above: jest.fn().mockReturnValue(mockDb),
    fetchSheetByUserId: () => mockDb // similarly this didn't work: jest.fn().mockReturnValue(mockDb)
}));

jest.mock('../../queries/sheetQueries', () => ({
    __esModule: true,
    ...jest.requireActual('../../queries/sheetQueries'),
    sheetsQuery: () => ({ data: { sheets: [] } })
}));

describe('App', () => {
    test('it gets the user & session ids from getUserInfoFromCookie', () => {
        const { unmount } = setupApp();
        expect(getUserInfoFromCookie()).toEqual({ userId: '123ABC', sessionId: '456DEF' });
        unmount();
    });

    test('it renders and displays the heading', async () => {
        const { unmount } = setupApp();
        const title = decodeText(mockDb.title);
        expect(await screen.findByText(title)).toBeInTheDocument();
        unmount();
    });

    test('it displays the mock sheet content for cell A1', async () => {
        const { unmount } = setupApp();
        // screen.debug(); // prints out the DOM, but prior to the cells being loaded, so not much use here
        const cells = mockDb.cells;
        const cellA1Text = decodeText(cells[0].content.text);
        expect(await screen.findByText(cellA1Text)).toBeInTheDocument(); // note that this will throw an error if the cell text is empty
        unmount();
    });

    test('it renders the first and last rows', async () => {
        const { unmount } = setupApp();
        expect(await screen.findByTestId('rowHeader_0')).toBeInTheDocument();

        const lastRowId = 'rowHeader_' + (mockDb.metadata.totalRows - 1);
        expect(await screen.findByTestId(lastRowId)).toBeInTheDocument();
        unmount();
    });

    test('it renders the first and last columns', async () => {
        const { unmount } = setupApp();
        expect(await screen.findByTestId('columnHeader_0')).toBeInTheDocument();

        const lastColumnId = 'columnHeader_' + (mockDb.metadata.totalColumns - 1);
        expect(await screen.findByTestId(lastColumnId)).toBeInTheDocument();
        unmount();
    });

    test('it renders the cell in the last row & last column', async () => {
        const { unmount } = setupApp();
        const lastRow = mockDb.metadata.totalRows - 1;
        const lastColumn = mockDb.metadata.totalColumns - 1;
        const cellId = createCellId(lastRow, lastColumn);
        expect(await screen.findByTestId(cellId)).toBeInTheDocument();
        unmount();
    });
});

// this is the best tutorial on using react testing library
// https://www.robinwieruch.de/react-testing-library