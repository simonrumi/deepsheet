import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FilterOptions from '../molecules/FilterOptions';
import ToolModalHeading from '../atoms/ToolModalHeading';
import CloseIcon from '../atoms/IconClose';
import { stateShowFilterModal, stateFilterRowIndex, stateFilterColumnIndex, stateFilterIsStale } from '../../helpers/dataStructureHelpers';
import { filterEditCancelled } from '../../actions/filterActions';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT } from '../../constants';

const FilterModal = props => {
   const showFilterModal = useSelector(state => stateShowFilterModal(state));
   const rowIndex = useSelector(state => stateFilterRowIndex(state));
   const columnIndex = useSelector(state => stateFilterColumnIndex(state));
   const isStale = useSelector(state => stateFilterIsStale(state));

   // rare case of using local state. Tracking what the isStale prop was as we open the filter modal
   // this is so it can be reinstated if we cancel out of the filter modal
   const [wasStale, setWasStale] = useState(false);
   useEffect(() => setWasStale(isStale), [isStale]); 

   if (showFilterModal) {
      return (
         <div className="fixed z-50 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
            <div className="flex justify-between items-center">
               <ToolModalHeading rowIndex={rowIndex} columnIndex={columnIndex} />
               <CloseIcon onClickFn={() => filterEditCancelled(wasStale)} width={TOOL_ICON_WIDTH} height={TOOL_ICON_HEIGHT} />
            </div>
            <FilterOptions />
         </div>
      );
   }
   return null;
}

export default FilterModal;
