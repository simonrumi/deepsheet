import React from 'react';
import { useSelector } from 'react-redux';
import { stateFrozenColumns } from '../../helpers/dataStructureHelpers';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import ColumnHeaderDetail from '../molecules/ColumnHeaderDetail';
import ColumnResizer from '../molecules/ColumnResizer';
import { COLUMN_HEADER_TEST_ID } from '../../__tests__/testHelpers/constants';

const ColumnHeader = ({ index }) => {
   const frozenColumns = useSelector(state => stateFrozenColumns(state));

   const columnFrozen = getObjectFromArrayByKeyValue('index', index, frozenColumns);
   const columnId = COLUMN_HEADER_TEST_ID + index;
      return (
         <div 
            className="flex flex-row justify-between w-full h-full border-t border-l p-0" 
            id={columnId} 
            data-testid={columnId}
         >
            <ColumnHeaderDetail index={index} frozen={columnFrozen?.isFrozen || false} />
            <ColumnResizer
               columnIndex={index}
            />
         </div>
      );
}

export default ColumnHeader;