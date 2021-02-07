import React from 'react';
import managedStore from '../../store';
import { cellRow } from '../../helpers/dataStructureHelpers';
import RowResizer from '../molecules/RowResizer';
import RowHeaderDetail from '../molecules/RowHeaderDetail';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import { stateFrozenRows } from '../../helpers/dataStructureHelpers';

const RowHeader  = props => {
   const { cell } = props;
   const row = cellRow(cell);
   const rowFrozen = getObjectFromArrayByKeyValue('index', row, stateFrozenRows(managedStore.state));   
   return (
      <div id={'rowHeader_' + row} className="flex flex-col justify-between w-full h-full border-t border-l" >
         <RowHeaderDetail cell={cell} frozen={rowFrozen?.isFrozen || false} />
         <RowResizer rowIndex={row} />
      </div>
   );
}
export default RowHeader;
