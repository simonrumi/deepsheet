import React from 'react';
import { fireEvent } from '@testing-library/react';
import Cell from '../../components/Cell';
import mockSheet from '../../mockSubSheet';
import renderWithRedux from '../renderWithRedux';

describe('Cell', () => {
   const rowIndex = 1;
   const colIndex = 2;
   const cellKey = 'cell_' + rowIndex + '_' + colIndex;
   let queries;

   beforeEach(() => {
      //QQQQ cell content is not rendering - debug to see what happens when Cell is created by the test
      queries = renderWithRedux(
         <Cell cellKey={cellKey} key={cellKey} />,
         mockSheet
      );
   });

   it('should render a cell with the correct id and content', () => {
      debugger;
      const cellContent = mockSheet.rows[rowIndex].columns[colIndex].content;
      expect(queries.getByText(cellContent)).not.toBe(null);
   });
});
