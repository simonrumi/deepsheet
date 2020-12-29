import React from 'react';
import { useSelector } from 'react-redux';
import { sortCancelled } from '../../actions/sortActions';
import SortOptions from '../molecules/SortOptions';
import ToolModalHeading from '../atoms/ToolModalHeading';
import CloseIcon from '../atoms/IconClose';
import { stateShowSortModal, stateSortRowIndex, stateSortColumnIndex } from '../../helpers/dataStructureHelpers';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT } from '../../constants';

// TODO 
// - go back and fix bug whereby adding columns messes up the grid

const SortModal = props => {
   const showSortModal = useSelector(state => stateShowSortModal(state));
   const sortRowIndex = useSelector(state => stateSortRowIndex(state));
   const sortColumnIndex = useSelector(state => stateSortColumnIndex(state));
   console.log('SortModal got showSortModal', showSortModal, 'sortRowIndex', sortRowIndex, 'sortColumnIndex', sortColumnIndex);
   
   if (showSortModal) {
      const classes = "fixed z-50 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2";
      return (
         <div className={classes} >
            <div className="flex justify-between items-center">
               <ToolModalHeading rowIndex={sortRowIndex} columnIndex={sortColumnIndex} />
               <CloseIcon onClickFn={sortCancelled} width={TOOL_ICON_WIDTH} height={TOOL_ICON_HEIGHT} />
            </div>
            <SortOptions
               classes=""
               className={classes}
               rowIndex={sortRowIndex}
               columnIndex={sortColumnIndex}
            />
         </div>
      );
   }
}

export default SortModal
