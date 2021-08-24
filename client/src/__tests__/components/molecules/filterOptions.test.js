import { screen } from '@testing-library/react';
import  * as R from 'ramda';
import { /* render, */ fireEvent } from '../../testHelpers/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
// import { getUserInfoFromCookie } from '../../../helpers/userHelpers';
import { createCellId } from '../../../helpers/cellHelpers';
import { mockDb } from '../../../__data__/mockDb';
import { 
    ROW_FILTER_ICON_TEST_ID, 
    ROW_HEADER_TEST_ID,
    COLUMN_HEADER_TEST_ID,
    FILTER_TEXT_TEST_ID, 
    FILTER_HIDE_BLANKS_TEST_ID,
    FILTER_CASE_SENSITIVE_TEST_ID,
    FILTER_REGEX_TEST_ID,
    FILTER_SUBMIT_TEST_ID,
    FILTER_CLEAR_ALL_TEST_ID
 } from '../../testHelpers/constants';
import { setupApp } from '../../testHelpers';
import { isSomething, ifThenElse } from '../../../helpers';

jest.mock('../../../helpers/userHelpers', () => ({
    __esModule: true,
    ...jest.requireActual('../../../helpers/userHelpers'),
    getUserInfoFromCookie: jest.fn().mockReturnValue({ userId: '123ABC', sessionId: '456DEF' })
}));

jest.mock('../../../services/sheetServices', () => ({
    __esModule: true,
    ...jest.requireActual('../../../services/sheetServices'),
    fetchSheet: () => mockDb, // for whatever reason this didn't work, although it worked above: jest.fn().mockReturnValue(mockDb),
    fetchSheetByUserId: () => mockDb // similarly this didn't work: jest.fn().mockReturnValue(mockDb)
}));

jest.mock('../../../queries/sheetQueries', () => ({
    __esModule: true,
    ...jest.requireActual('../../../queries/sheetQueries'),
    sheetsQuery: () => ({ data: { sheets: [] } })
}));

const checkRowsAndColumnsVisibility = (screen, { visibleRows, hiddenRows, visibleColumns, hiddenColumns }) => {
    R.forEach(async index => {
            expect(await screen.queryByTestId(ROW_HEADER_TEST_ID + index)).not.toBeNull();
        },
        visibleRows
    );
    R.forEach(async index => {
            expect(await screen.queryByTestId(ROW_HEADER_TEST_ID + index)).toBeNull();
        },
        hiddenRows
    );
    R.forEach(async index => {
            expect(await screen.queryByTestId(COLUMN_HEADER_TEST_ID + index)).not.toBeNull();
        },
        visibleColumns
    );
    R.forEach(async index => {
            expect(await screen.queryByTestId(COLUMN_HEADER_TEST_ID + index)).toBeNull();
        },
        hiddenColumns
    );

    // check all the cells
    const allRows = R.concat(visibleRows, hiddenRows);
    const allColumns = R.concat(visibleColumns, hiddenColumns);
    R.forEach(async rowIndex => {
            R.forEach(async columnIndex => {
                    const cellId = createCellId(rowIndex, columnIndex);
                    await ifThenElse({
                        ifCond: () => 
                            isSomething(R.find(R.equals(rowIndex), hiddenRows)) || 
                            isSomething(R.find(R.equals(columnIndex), hiddenColumns)),
                        thenDo: async () => expect(await screen.queryByTestId(cellId)).toBeNull(),
                        elseDo: async () => expect(await screen.queryByTestId(cellId)).not.toBeNull(),
                        params: {}
                    });
                },
                allColumns
            )
        },
        allRows
    );
}

const launchRowFilterModal = async (screen, rowIndex) => {
    // click the cog in the row row
    const rowHeaderIndex = await screen.findByTestId(ROW_HEADER_TEST_ID + rowIndex);
    const rowIndexCog = rowHeaderIndex.querySelector('div:nth-child(1) > div:nth-child(2) > svg');
    userEvent.click(rowIndexCog);

    // click the filter icon to launch the filter modal
    const rowFilterIconIndex = await screen.findByTestId(ROW_FILTER_ICON_TEST_ID + rowIndex);
    userEvent.click(rowFilterIconIndex);
}

describe('FilterOptions', () => {
    test('it renders and displays the filter options form', async () => {
        const { unmount } = setupApp();

        await launchRowFilterModal(screen, 4);
        expect(await screen.findByTestId(FILTER_TEXT_TEST_ID)).not.toBeNull();
        expect(await screen.findByTestId(FILTER_HIDE_BLANKS_TEST_ID)).not.toBeNull();
        expect(await screen.findByTestId(FILTER_CASE_SENSITIVE_TEST_ID)).not.toBeNull();
        expect(await screen.findByTestId(FILTER_REGEX_TEST_ID)).not.toBeNull();
        expect(await screen.findByTestId(FILTER_SUBMIT_TEST_ID)).not.toBeNull();
        expect(await screen.findByTestId(FILTER_CLEAR_ALL_TEST_ID)).not.toBeNull();

        unmount();
    });

    test('filter row 5 by the word "show", then clear all filters', async () => {
        const { unmount } = setupApp();

        await launchRowFilterModal(screen, 4);

        // type "show" into the text field
        const textField = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        userEvent.type(textField, 'show');
        expect(textField.value).toBe('show');

        // click the submit button to hide all columns including those with "hide" in them
        const submitFilterOptionsBtn = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilterOptionsBtn);
        expect(screen.queryByText('hide')).toBeNull();

        // the following is dependent on having the word "show" in columns B, C & F only
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [0,1,2,3,4,5,6,7],
            hiddenRows: [], 
            visibleColumns: [1, 2, 5],
            hiddenColumns: [0,3,4,6,7,8]
        });

        // open the filter modal again
        await launchRowFilterModal(screen, 4);
        const filterTextbox = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        expect(filterTextbox.value).toEqual('show');

        // click the clear all filters button
        const clearAllFiltersBtn = await screen.findByTestId(FILTER_CLEAR_ALL_TEST_ID);
        await userEvent.click(clearAllFiltersBtn);
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [0,1,2,3,4,5,6,7],
            hiddenRows: [], 
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        unmount();
    });

    test.skip('filter input is updated correctly', () => {
        const { container, unmount, inputField } = setupApp();
        fireEvent.change(inputField, {target: {value: 'my filter text'}}); // TODO replace this with userEvent
        expect(inputField.value).toBe('my filter text');
        unmount();
    });

    test.skip('"hide blanks" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setupApp();
        const hideBlanksCheckbox = getByTestId('hideBlanksCheckbox');
        userEvent.click(hideBlanksCheckbox);
        expect(hideBlanksCheckbox.value).toBe("true");
        userEvent.click(hideBlanksCheckbox);
        expect(hideBlanksCheckbox.value).toBe("false");
        unmount();
    });

    test.skip('"case sensitive" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setupApp();
        const caseSensitiveCheckbox = getByTestId('caseSensitiveCheckbox');
        userEvent.click(caseSensitiveCheckbox);
        expect(caseSensitiveCheckbox.value).toBe("true");
        userEvent.click(caseSensitiveCheckbox);
        expect(caseSensitiveCheckbox.value).toBe("false");
        unmount();
    });

    test.skip('"regular expression" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setupApp();
        const regexCheckbox = getByTestId('regexCheckbox');
        userEvent.click(regexCheckbox);
        expect(regexCheckbox.value).toBe("true");
        userEvent.click(regexCheckbox);
        expect(regexCheckbox.value).toBe("false");
        unmount();
    });
});