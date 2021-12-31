import React from 'react';
import { useSelector } from 'react-redux';
import managedStore from '../../store';
import { COLUMN_AXIS, TOOL_ICON_WIDTH } from '../../constants';
import { COLUMN_FILTER_ICON_TEST_ID } from '../../__tests__/testHelpers/constants';
import {
   stateColumnFilters,
   stateAxisItemToolIsVisible,
   stateAxisItemToolAxis,
   stateAxisItemToolIndex,
} from '../../helpers/dataStructureHelpers';
import { getInitialFilterValues, isFilterEngaged } from '../../helpers/visibilityHelpers';
import { hidePopups } from '../../actions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { toggledShowFilterModal } from '../../actions/filterActions';
import { toggledShowSortModal } from '../../actions/sortActions';
import { updatedFrozenColumns, updatedAxisItemTool } from '../../actions/metadataActions';
import { UPDATED_FROZEN_COLUMNS } from '../../actions/metadataTypes';
import { createToggleFreezeColumnMessage } from '../displayText';
import FilterIcon from '../atoms/IconFilter';
import SnowflakeIcon from '../atoms/IconSnowflake';
import SortIcon from '../atoms/IconSort';

const ColumnHeaderTools = ({ index, frozen }) => {
   const toolIsVisible = useSelector(state => stateAxisItemToolIsVisible(state));
   const toolAxis = useSelector(state => stateAxisItemToolAxis(state));
   const toolIndex = useSelector(state => stateAxisItemToolIndex(state));

   const showSortModalForColumn = columnIndex => {
      toggledShowSortModal(
         null,
         columnIndex,
      );
   }
   
   const showFilterModalForColumn = columnIndex => {
      toggledShowFilterModal(
         null,
         columnIndex,
         getInitialFilterValues({ state: managedStore.state, columnIndex })
      );
      hidePopups();
   }

   const toggleFreeze = () => {
      startedUndoableAction({ undoableType: UPDATED_FROZEN_COLUMNS, timestamp: Date.now() });
      updatedFrozenColumns([{ index, isFrozen: !frozen }]);
      completedUndoableAction({
			undoableType: UPDATED_FROZEN_COLUMNS,
			message: createToggleFreezeColumnMessage({ columnIndex: index }),
			timestamp: Date.now(),
		});
   };

   // ColumnHeaderDetail pops up these ColumnHeaderTools (onCLick), and here we handle hiding it (onMouseLeave)
   const hideToolForColumn = event => {
      updatedAxisItemTool({
         axis: COLUMN_AXIS,
         index,
         isVisible: false,
      });
   }

   const positioningStyle = () => {
      const columnHeaderElement = document.getElementById('columnHeader_' + index);
      const columnHeaderBoundingRect = columnHeaderElement.getBoundingClientRect();
      // there's no concrete reason for having the magic numbers 2 and 3 below, except that they are what makes it look decent
      const left = `calc(${columnHeaderBoundingRect.left}px + ${columnHeaderBoundingRect.width}px - 3 * ${TOOL_ICON_WIDTH})`;
      const top = `${columnHeaderBoundingRect.top + columnHeaderBoundingRect.height / 2}px`;
      return {
         left,
         top,
      };
   };

   const iconHeadingClasses = 'text-grey-blue text-xs';
   const iconColumnClasses = 'flex flex-col justify-between items-center';
   const toolContainerClasses = 'absolute flex justify-between z-10 bg-white border border-grey-blue shadow-lg p-1 cursor-default';
         
   const shouldShowTool = () => toolAxis === COLUMN_AXIS && toolIndex === index && toolIsVisible;

   const render = () => {
      return shouldShowTool() 
      ? (
         <div 
            className={toolContainerClasses}
            style={positioningStyle()}
            onMouseLeave={hideToolForColumn}
         >
            <div className={iconColumnClasses}>
               <div className={iconHeadingClasses}>freeze</div>
               <SnowflakeIcon classes="p-1" switchedOn={frozen} onClickFn={toggleFreeze} />
            </div>
            <div className={iconColumnClasses}>
               <div  className={iconHeadingClasses}>filter</div>
               <FilterIcon
                  classes="p-1"
                  fitlerEngaged={isFilterEngaged(index, stateColumnFilters(managedStore.state))}
                  onClickFn={() => showFilterModalForColumn(index)}
                  testId={COLUMN_FILTER_ICON_TEST_ID + index}
               />
            </div>
            <div className={iconColumnClasses}>
               <div className={iconHeadingClasses}>sort</div>
               <SortIcon classes="p-1" onClickFn={() => showSortModalForColumn(index)} />
            </div>
         </div>
      )
      : null;
   };

   return render();
}

export default ColumnHeaderTools;