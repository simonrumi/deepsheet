import React from 'react';
import { useSelector } from 'react-redux';
import { stateFrozenColumns } from '../../helpers/dataStructureHelpers';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import ColumnHeaderDetail from '../molecules/ColumnHeaderDetail';
import ColumnResizer from '../molecules/ColumnResizer';

const ColumnHeader = props => {
   const { index } = props;
   const frozenColumns = useSelector(state => stateFrozenColumns(state));

   const columnFrozen = getObjectFromArrayByKeyValue('index', index, frozenColumns);
      return (
         <div className="flex flex-row justify-between w-full h-full border-t border-l p-0" id={'columnHeader_' + index} >
            <ColumnHeaderDetail index={index} frozen={columnFrozen?.isFrozen || false} />
            <ColumnResizer
               columnIndex={index}
            />
         </div>
      );
}

export default ColumnHeader;