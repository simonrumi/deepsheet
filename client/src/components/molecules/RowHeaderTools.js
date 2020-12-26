import React from 'react';
import { useSelector } from 'react-redux';
import managedStore from '../../store';
import * as R from 'ramda';
import { ROW_AXIS } from '../../constants';
import {
   stateRowFilters,
   stateAxisItemToolIsVisible,
   stateAxisItemToolAxis,
   stateAxisItemToolIndex,
} from '../../helpers/dataStructureHelpers';
import { isSomething, arrayContainsSomething } from '../../helpers';
import { getInitialFilterValues } from '../../helpers/visibilityHelpers';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { toggledShowFilterModal } from '../../actions/filterActions';
import { updatedFrozenRows, updatedAxisItemTool } from '../../actions/metadataActions';
import FilterIcon from '../atoms/IconFilter';
import SnowflakeIcon from '../atoms/IconSnowflake';

const RowHeaderTools = props => {
   const { index, frozen, } = props;
   const toolIsVisible = useSelector(state => stateAxisItemToolIsVisible(state));
   const toolAxis = useSelector(state => stateAxisItemToolAxis(state));
   const toolIndex = useSelector(state => stateAxisItemToolIndex(state));

   const showFilterModalForRow = rowIndex =>
      toggledShowFilterModal(
         rowIndex,
         null,
         getInitialFilterValues({ state: managedStore.state, rowIndex })
      );

   const isFilterEngaged = (rowIndex, rowFilters) => {
      if (arrayContainsSomething(rowFilters)) {
         return R.pipe(
            R.find(R.pipe(R.prop('index'), R.equals(rowIndex))),
            R.prop('filterExpression'),
            isSomething
         )(rowFilters);
      }
      return false;
   };

   const toggleFreeze = () => {
      startedUndoableAction();
      updatedFrozenRows([{ index, isFrozen: !frozen }]);
      completedUndoableAction('toggled freeze for row ' + index);
   };

   // RowHeaderDetail pops up these RowHeaderTools (onCLick), and here we handle hiding it (onMouseLeave)
   const hideToolForRow = event => {
      updatedAxisItemTool({
         axis: ROW_AXIS,
         index,
         isVisible: false,
      });
   }

   const positioningStyle = () => {
      const rowHeaderElement = document.getElementById('rowHeader_' + index);
      const rowHeaderBoundingRect = rowHeaderElement.getBoundingClientRect();
      // the magic numbers in here have no real logic to them - they are just what made for what looked like good sizing
      const left = `${rowHeaderBoundingRect.left + rowHeaderBoundingRect.width / 2}px`;
      const top = `${rowHeaderBoundingRect.height / 2}px`;
      return {
         left,
         top,
      };
   };

   const iconHeadingClasses = 'text-grey-blue text-xs';
   const iconColumnClasses = 'flex flex-col justify-between items-center';
   const toolContainerClasses = 'absolute flex justify-between z-10 bg-white border border-grey-blue shadow-lg p-1 cursor-default';
         
   const shouldShowTool = () => toolAxis === ROW_AXIS && toolIndex === index && toolIsVisible;

   const render = () => {
      return shouldShowTool() 
      ? (
         <div 
            className={toolContainerClasses}
            style={positioningStyle()}
            onMouseLeave={hideToolForRow}
         >
            <div className={iconColumnClasses}>
               <div className={iconHeadingClasses}>freeze</div>
               <SnowflakeIcon classes="p-1" switchedOn={frozen} onClickFn={toggleFreeze} />
            </div>
            <div className={iconColumnClasses}>
               <div  className={iconHeadingClasses}>filter</div>
               <FilterIcon
                  key={'iconFilter_' + index}
                  classes={'p-1'}
                  fitlerEngaged={isFilterEngaged(index, stateRowFilters(managedStore.state))}
                  onClickFn={() => showFilterModalForRow(index)}
               />
            </div>
            
         </div>
      )
      : null;
   };

   return render();
}

export default RowHeaderTools;