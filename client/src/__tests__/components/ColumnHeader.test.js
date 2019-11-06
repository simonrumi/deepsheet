import React from 'react';
import { fireEvent } from '@testing-library/react';
import ColumnHeaders from '../../components/ColumnHeaders';
import mockSheet from '../../mockSubSheet';
import { indexToColumnLetter } from '../../helpers';
import renderWithRedux from '../renderWithRedux';

describe('ColumnHeader', () => {
   let queries;
   beforeEach(() => {
      queries = renderWithRedux(<ColumnHeaders />, mockSheet);
   });

   it('renders a column header row with letters for the column names', () => {
      const highestLetter = indexToColumnLetter(
         mockSheet.metadata.totalColumns - 1
      );
      expect(queries.getByText(highestLetter)).not.toBe(null);
   });

   it('renders at least one column', () => {
      expect(queries.getByText('A')).not.toBe(null);
   });

   it('clicking the filter icon opens a filter dialog', () => {
      fireEvent.click(
         queries.getByTestId('col' + (mockSheet.metadata.totalColumns - 1))
      );
      expect(
         queries.getByText(
            'this will break as the feature is not implemented yet'
         )
      ).not.toBe(null);
   });
});
