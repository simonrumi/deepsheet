import React from 'react';
import { useSelector } from 'react-redux';
import managedStore from '../../store';
import * as R from 'ramda';
import { COLUMN_AXIS, TOOL_ICON_WIDTH } from '../../constants';
import {
   stateColumnFilters,
   stateAxisItemToolIsVisible,
   stateAxisItemToolAxis,
   stateAxisItemToolIndex,
} from '../../helpers/dataStructureHelpers';
import { isSomething, arrayContainsSomething } from '../../helpers';
import { getInitialFilterValues } from '../../helpers/visibilityHelpers';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { toggledShowFilterModal } from '../../actions/filterActions';
import { updatedFrozenColumns, updatedAxisItemTool } from '../../actions/metadataActions';
import FilterIcon from '../atoms/IconFilter';
import SnowflakeIcon from '../atoms/IconSnowflake';

const ColumnHeaderTools = props => {
   const { index, frozen } = props;
   const toolIsVisible = useSelector(state => stateAxisItemToolIsVisible(state));
   const toolAxis = useSelector(state => stateAxisItemToolAxis(state));
   const toolIndex = useSelector(state => stateAxisItemToolIndex(state));

   const showFilterModalForColumn = columnIndex =>
      toggledShowFilterModal(
         null,
         columnIndex,
         getInitialFilterValues({ state: managedStore.state, columnIndex })
      );

   const isFilterEngaged = (columnIndex, columnFilters) => {
      if (arrayContainsSomething(columnFilters)) {
         return R.pipe(
            R.find(R.pipe(R.prop('index'), R.equals(columnIndex))),
            R.prop('filterExpression'),
            isSomething
         )(columnFilters);
      }
      return false;
   };

   const toggleFreeze = () => {
      startedUndoableAction();
      updatedFrozenColumns([{ index, isFrozen: !frozen }]);
      completedUndoableAction('toggled freeze for column ' + index);
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
               />
            </div>
            
         </div>
      )
      : null;
   };

   return render();
}

export default ColumnHeaderTools;