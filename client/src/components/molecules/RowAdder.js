import React from 'react';
import insertNewRows from '../../services/insertNewRows';
import IconAdd from '../atoms/IconAdd';

const onClickRowAdder = evt => {
   evt.preventDefault();
   insertNewRows();
};

const RowAdder = ({ classes }) => {
   return (
      <div className={classes} data-testid="rowAdder">
         <div className="flex items-center px-2 py-2">
            <IconAdd
               classes={'flex-1 h-3 w-3'}
               onClickFn={onClickRowAdder}
            />
         </div>
      </div>
   );
}

export default RowAdder;
