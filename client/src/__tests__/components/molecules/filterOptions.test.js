import React from 'react';
import FilterOptions from '../../../components/molecules/FilterOptions';
import { render, fireEvent } from '../../../testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import mockSheet from '../../../__data__/mockSheet_FilterOptions';

describe('FilterOptions', () => {
    const setup = () => {
        const renderObj = render(<FilterOptions />, { preloadedState: mockSheet });
        const { container, getByTestId } = renderObj;
        const inputField = getByTestId('filterText');
        return {
            ...renderObj,
            inputField,
        }
    }

    test('it renders and displays the appropriate form', () => {
        const { container, unmount, queryAllByText } = setup();
        expect(queryAllByText(/Filter/i)).not.toHaveLength(0);
        expect(queryAllByText(/Hide blanks/i)).not.toHaveLength(0);
        expect(queryAllByText(/Case sensitive/i)).not.toHaveLength(0);
        expect(queryAllByText(/Regular expression/i)).not.toHaveLength(0);
        expect(queryAllByText(/Filter it!/i)).not.toHaveLength(0);
        expect(queryAllByText(/Clear All Filtering/i)).not.toHaveLength(0);
        unmount();
    });

    test('filter input is updated correctly', () => {
        const { container, unmount, inputField } = setup();
        fireEvent.change(inputField, {target: {value: 'my filter text'}}); // TODO replace this with userEvent
        expect(inputField.value).toBe('my filter text');
        unmount();
    });

    test('"hide blanks" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setup();
        const hideBlanksCheckbox = getByTestId('hideBlanksCheckbox');
        userEvent.click(hideBlanksCheckbox);
        expect(hideBlanksCheckbox.value).toBe("true");
        userEvent.click(hideBlanksCheckbox);
        expect(hideBlanksCheckbox.value).toBe("false");
        unmount();
    });

    test('"case sensitive" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setup();
        const caseSensitiveCheckbox = getByTestId('caseSensitiveCheckbox');
        userEvent.click(caseSensitiveCheckbox);
        expect(caseSensitiveCheckbox.value).toBe("true");
        userEvent.click(caseSensitiveCheckbox);
        expect(caseSensitiveCheckbox.value).toBe("false");
        unmount();
    });

    test('"regular expression" checkmark is updated correctly when clicked', () => {
        const { unmount, getByTestId } = setup();
        const regexCheckbox = getByTestId('regexCheckbox');
        userEvent.click(regexCheckbox);
        expect(regexCheckbox.value).toBe("true");
        userEvent.click(regexCheckbox);
        expect(regexCheckbox.value).toBe("false");
        unmount();
    });

    test('filter row 5 by the word "show"', () => {
        const filterModalState = {
            caseSensitive: false,
            columnIndex: null,
            filterExpression: "show",
            hideBlanks: false,
            initialValues: null,
            isStale: false,
            regex: false,
            rowIndex: 4,
            showFilterModal: true
        };
        const { unmount, inputField, getByTestId } = setup();
        userEvent.type(inputField, 'show');
        expect(inputField.value).toBe('show');
        const submitFilterOptionsBtn = getByTestId('submitFilterOptions');
        userEvent.click(submitFilterOptionsBtn);
        const columnVisibility = stateColumnVisibility(managedStore.state);
        expect(columnVisibility).toHaveLength(9);
        unmount();

        // TODO NEXT - bug with reading the state properly
    });


});