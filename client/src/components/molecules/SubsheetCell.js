import React, { useRef, useEffect } from 'react';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus, updatedFocusRef, updatedFromCell } from '../../actions/focusActions';
import { ifThen, ifThenElse } from '../../helpers';
import { cellText, stateFocusAbortControl } from '../../helpers/dataStructureHelpers';
import { manageKeyBindings, manageTab, rangeSelected, updateCellsInRange } from '../../helpers/focusHelpers';
import SubsheetCellTools from './SubsheetCellTools';

const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-vibrant-purple' : 'border border-pale-purple';
   return cellBaseClasses + borderClasses;
};

const manageEsc = event => {
   event.preventDefault();
   stateFocusAbortControl(managedStore.state).abort();
   updatedFocusRef({ ref: null }); // clear the existing focusRef
   updateCellsInRange(false); // false means we're finding then removing all the cells from the range
   clearedFocus();
}

const SubsheetCell = React.memo(({ cell, cellHasFocus }) => {
   const cellRef = useRef();

   const keyBindingsSubsheetCell = event => {
      // use https://keycode.info/ to get key values
      // apparently should be using event.key instead, but it returns values like "Enter" and "Tab" so need to handle both
      switch(event.keyCode) {
         case 27: // esc
            manageEsc(event);
            break;
         case 9: // tab
            manageTab({ event, cell });
            break;
         default:
      }
   };

   // note when a cell is clicked onSubsheetCellClick will focus the cell, which will cause the useEffect below to fire this manageFocus function
   // whereas when a cell is tabbed into, the focus will be updated by the manageTab function, again causing the useEffect below to fire this function
   const manageFocus = event => {
      manageKeyBindings({ event, cell, cellRef, keyBindings: keyBindingsSubsheetCell });
      updatedFromCell(cell);
   }

   const onSubsheetCellClick = event => {
      event.preventDefault();
      ifThenElse({
         ifCond: event.shiftKey,
         thenDo: [ rangeSelected, hidePopups ],
         elseDo: [
            () => updateCellsInRange(false), // find & remove all the cells from the range, to clear any previous range
            () => focusedCell(cell),
            hidePopups
         ],
         params: { thenParams: cell }
      });
   }

   useEffect(() => {
      ifThen({
         ifCond: cellHasFocus,
         thenDo: () => manageFocus(null), // null becuase there is no event to send
         params: {} 
      });
   });

   // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
   // while these classes create a 1x1 grid that takes up the full space within that:
   // grid items-stretch
   const baseClasses = 'grid-item grid items-stretch cursor-pointer border-t border-l';
   const backgroundClasses = cell.inCellRange ? ' bg-light-light-blue' : '';
   return (
      <div
         className={baseClasses + backgroundClasses}
      >
         <div 
            className={innerDivClassNames(cellHasFocus)} 
            ref={cellRef}
            onClick={onSubsheetCellClick}
         >
            <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} />
            {cellText(cell)}
         </div>
      </div>
   );
   // not adding an onFocus handler into the div as we are handling focus with the setTimeout
});

export default SubsheetCell;
