import React from 'react';
import insertNewColumns from '../../services/insertNewColumns';
import IconAdd from '../atoms/IconAdd';

const onClickColumnAdder = evt => {
   evt.preventDefault();
   insertNewColumns();
}

const ColumnAdder = ({ classes }) => {
   const allClasses = classes + ' border-r';
   return (
      <div className={allClasses} data-testid="columnAdder">
         <div className="flex items-center px-2 py-1">
            <IconAdd
               classes={'flex-1 h-3 w-3'}
               onClickFn={onClickColumnAdder}
            />
         </div>
      </div>
   );
}

export default ColumnAdder;