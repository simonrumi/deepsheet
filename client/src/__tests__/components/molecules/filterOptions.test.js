import { screen } from '@testing-library/react';
import  * as R from 'ramda';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createCellId } from '../../../helpers/cellHelpers';
import { mockDb } from '../../../__data__/mockDb';
import { 
    ROW_HEADER_TEST_ID,
    ROW_GEAR_ICON_TEST_ID,
    ROW_FILTER_ICON_TEST_ID, 
    COLUMN_HEADER_TEST_ID,
    COLUMN_GEAR_ICON_TEST_ID,
    COLUMN_FILTER_ICON_TEST_ID,
    FILTER_TEXT_TEST_ID, 
    FILTER_HIDE_BLANKS_TEST_ID,
    FILTER_CASE_SENSITIVE_TEST_ID,
    FILTER_REGEX_TEST_ID,
    FILTER_SUBMIT_TEST_ID,
    FILTER_CLEAR_ALL_TEST_ID,
    UNDO_TEST_ID,
 } from '../../testHelpers/constants';
import { setupApp } from '../../testHelpers';
// import { waitFor, fireEvent, waitForElementToBeRemoved } from '../../testHelpers/testUtils';
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
    const rowCog = await screen.findByTestId(ROW_GEAR_ICON_TEST_ID + rowIndex);
    userEvent.click(rowCog);

    // click the filter icon to launch the filter modal
    const rowFilterIcon = await screen.findByTestId(ROW_FILTER_ICON_TEST_ID + rowIndex);
    userEvent.click(rowFilterIcon);
}

const launchColumnFilterModal = async (screen, columnIndex) => {
    // click the cog in the row row
    const columnCog = await screen.findByTestId(COLUMN_GEAR_ICON_TEST_ID + columnIndex);
    userEvent.click(columnCog);

    // click the filter icon to launch the filter modal
    const columnFilterIcon = await screen.findByTestId(COLUMN_FILTER_ICON_TEST_ID + columnIndex);
    userEvent.click(columnFilterIcon);
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

    test('filter column C with "hide blanks"', async () => {
        const { unmount } = setupApp();

        // launch the filter modal and click hide blanks
        await launchColumnFilterModal(screen, 2);
        const hideBlanksCheckbox = await screen.findByTestId(FILTER_HIDE_BLANKS_TEST_ID);
        userEvent.click(hideBlanksCheckbox);
        expect(hideBlanksCheckbox.value).toBe("true");

        // click the submit button
        const submitFilterOptionsBtn = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilterOptionsBtn);

        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [1,2,3,4],
            hiddenRows: [0,5,6,7],
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        unmount();
    });

    test('The "case sensitive" option works correctly (including use of undo)', async () => {
        const { unmount } = setupApp();

        // open the filter modal for row 5
        await launchRowFilterModal(screen, 4);

        // type "SHOW" into the text field
        const textFieldRow5 = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        userEvent.type(textFieldRow5, 'SHOW');
        expect(textFieldRow5.value).toBe('SHOW');

        //check the case sensitive option
        const caseSensitiveRow5 = await screen.findByTestId(FILTER_CASE_SENSITIVE_TEST_ID);
        userEvent.click(caseSensitiveRow5);
        expect(caseSensitiveRow5.value).toBe("true");

        // click the submit button
        const submitFilterRow5 = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilterRow5);
        expect(screen.queryByText('hide')).toBeNull();

        // since all the values of the word "show" are lowercase, no columns should be visible
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [0,1,2,3,4,5,6,7],
            hiddenRows: [],
            visibleColumns: [],
            hiddenColumns: [0,1,2,3,4,5,6,7,8]
        });

        // click the undo button
        const undoBtn = await screen.findByTestId(UNDO_TEST_ID);
        userEvent.click(undoBtn);

        // all cells should be visible again
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [0,1,2,3,4,5,6,7],
            hiddenRows: [],
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        // open the filter modal for column B
        await launchColumnFilterModal(screen, 1);

        // type "A" into the text field
        const textFieldColumnB = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        userEvent.type(textFieldColumnB, 'A');
        expect(textFieldColumnB.value).toBe('A');

        //check the case sensitive option
        const caseSensitiveColumnB = await screen.findByTestId(FILTER_CASE_SENSITIVE_TEST_ID);
        userEvent.click(caseSensitiveColumnB);
        expect(caseSensitiveColumnB.value).toBe("true");

        // click the submit button
        const submitFilterColumnB = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilterColumnB);

        // only rows with indexes 1,2,3 should be visible
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [1,2,3],
            hiddenRows: [0,4,5,6,7],
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        unmount();
    });

    test('another test for case sensitivity', async () => {
        const { unmount } = setupApp();

        // open the filter modal for column B
        await launchColumnFilterModal(screen, 1);

        // type "a" into the text field
        const textFieldColumnB = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        userEvent.type(textFieldColumnB, 'a');
        expect(textFieldColumnB.value).toBe('a');

        //check the case sensitive option
        const caseSensitiveColumnB = await screen.findByTestId(FILTER_CASE_SENSITIVE_TEST_ID);
        userEvent.click(caseSensitiveColumnB);
        expect(caseSensitiveColumnB.value).toBe("true");

        // click the submit button
        const submitFilterColumnB = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilterColumnB);

        // no rows should be visible since there are no lower case "a"s
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [],
            hiddenRows: [0,1,2,3,4,5,6,7],
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        unmount();
    })

    test('filtering by a regular expression works', async () => {
        const { unmount } = setupApp();

        // open the filter modal for column A
        await launchColumnFilterModal(screen, 0);

        // type regex into the text field
        const textField = await screen.findByTestId(FILTER_TEXT_TEST_ID);
        userEvent.type(textField, 'i.*s$'); // cell A1 contains "using for testing of copy-pasting ranges" which will match this regex
        expect(textField.value).toBe('i.*s$');

        //check the regex option
        const regexCheckbox = await screen.findByTestId(FILTER_REGEX_TEST_ID);
        userEvent.click(regexCheckbox);
        expect(regexCheckbox.value).toBe("true");

        // click the submit button
        const submitFilter = await screen.findByTestId(FILTER_SUBMIT_TEST_ID);
        userEvent.click(submitFilter);

        // only row 1 should be visible
        checkRowsAndColumnsVisibility(screen, { 
            visibleRows: [0],
            hiddenRows: [1,2,3,4,5,6,7],
            visibleColumns: [0,1,2,3,4,5,6,7,8],
            hiddenColumns: []
        });

        unmount();
    });
});