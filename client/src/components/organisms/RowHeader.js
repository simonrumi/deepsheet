import React from 'react';
import { useSelector } from 'react-redux';
import { cellRow } from '../../helpers/dataStructureHelpers';
import RowResizer from '../molecules/RowResizer';
import RowHeaderDetail from '../molecules/RowHeaderDetail';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import { stateFrozenRows } from '../../helpers/dataStructureHelpers';
import { ROW_HEADER_TEST_ID } from '../../__tests__/testHelpers/constants';

const RowHeader  = ({ cell }) => {
   const row = cellRow(cell);
   const frozenRowsArr = useSelector(state => stateFrozenRows(state));
   const rowFrozen = getObjectFromArrayByKeyValue('index', row, frozenRowsArr); 
   const rowId =  ROW_HEADER_TEST_ID + row;
   return (
      <div 
         id={rowId} 
         className="flex flex-col justify-between w-full h-full border-t border-l" 
         data-testid={rowId}
      >
         <RowHeaderDetail cell={cell} frozen={rowFrozen?.isFrozen || false} />
         <RowResizer rowIndex={row} />
      </div>
   );
}
export default RowHeader;
