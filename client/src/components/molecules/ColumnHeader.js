import React from 'react';
import { indexToColumnLetter } from '../../helpers';
import IconFilter from '../atoms/IconFilter';

const ColumnHeader = ({ index, totalColumns, onFilterClick }) => {
   const columnLetter = indexToColumnLetter(index);
   const rightBorder = index === totalColumns - 1 ? 'border-r' : '';
   const classes =
      'grid-header-item text-grey-blue border-t border-l ' + rightBorder;

   return (
      <div className={classes} data-testid={'col' + index}>
         <div className="flex-2 items-center justify-between px-1">
            <div>{columnLetter}</div>
            <IconFilter classes={'flex-1 h-3 w-3'} onClick={onFilterClick} />
         </div>
      </div>
   );
};

export default ColumnHeader;
