import React from 'react';
import { /*render,*/ fireEvent } from '@testing-library/react';
//import '@testing-library/jest-dom/extend-expect'; // custom jest matchers from jest-dom
import RowHeader from '../../components/RowHeader';
import mockSheet from '../../mockSubSheet';
import renderWithRedux from '../renderWithRedux';

describe('RowHeader', () => {
   let queries;
   beforeEach(() => {
      queries = renderWithRedux(<RowHeader cellKey="cell_1_3" />, mockSheet);
   });

   it('renders a row header number extracted from the cellKey', () => {
      // note cell_1_3 means cell row index 1, (& column index 3)
      // meaning the 2nd row, so the rendered row number should be 2
      expect(queries.getByText('2')).not.toBe(null);
   });

   it('clicking the filter icon opens a filter dialog', () => {
      fireEvent.click(queries.getByTestId('row2'));
      expect(
         queries.getByText(
            'this will break as the feature is not implemented yet'
         )
      ).not.toBe(null);
   });
});
