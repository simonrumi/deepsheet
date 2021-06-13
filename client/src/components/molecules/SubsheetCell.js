import React, { useRef } from 'react';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus, updatedFocusRef } from '../../actions/focusActions';
import { isSomething, ifThen } from '../../helpers';
import { cellText, stateFocusAbortControl} from '../../helpers/dataStructureHelpers';
import { manageFocus, manageTab } from '../../helpers/focusHelpers';
import SubsheetCellTools from './SubsheetCellTools';  

// NOTE
// see this discussion on preventing children getting re-rendered
// https://spectrum.chat/react/help/updating-child-without-re-rendering-parent-in-react-hooks~abac18dc-019f-4954-8c3b-7ac8be672567
// they suggest useRef & useCallback and refer to https://overreacted.io/a-complete-guide-to-useeffect

// TODO BUG
// 1. filter some cells
// 2. don't save, but click on a subsheet cell & go to subsheet
// result: forced to log in
// 3. go back up to parent sheet
// result: filter not saved

// TODO BUG
// 1. click on subsheet cell to go to child
// 2. update the summary cell
// 3. return to parent
// result: subsheetCell contents are not updated until the page is refreshed

const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
   return cellBaseClasses + borderClasses;
};

const SubsheetCell = ({ cell, cellHasFocus }) => {
   const cellRef = useRef();
   
   const keyBindingsSubsheetCell = event => {
      // use https://keycode.info/ to get key values
      // apparently should be using event.key instead, but it returns values like "Enter" and "Tab" so need to handle both
      switch(event.keyCode) {
         case 27: // esc
            manageBlur(event);
            break;
         case 9: // tab
            manageTab({ event, cell });
            break;
         default:
      }
   };

   const manageBlur = event => {
      event.preventDefault();
      stateFocusAbortControl(managedStore.state).abort();
      updatedFocusRef({ ref: null }); // clear the existing focusRef
      clearedFocus();
   }

   const manageSubsheetCellFocus = event => {      
      ifThen({
         ifCond: manageFocus,
         thenDo: [ focusedCell, hidePopups ],
         params: { 
            ifParams: { event, cell, cellRef, keyBindings: keyBindingsSubsheetCell },
            thenParams: cell
         }
      });
   }

   // need to do this setTimeout workaround so the cellRef can first be assigned to the div
   // then we set the focus on that div 1 tick after. Replace this if a better way is found.
   window.setTimeout(() => {
      if (cellHasFocus && isSomething(cellRef.current)) {
         cellRef.current.focus();
         manageSubsheetCellFocus(null);
      }
   }, 0);

   // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
   // while these classes create a 1x1 grid that takes up the full space within that:
   // grid items-stretch
   return (
      <div
         className="grid-item grid items-stretch cursor-pointer border-t border-l"
         ref={cellRef}
         onClick={manageSubsheetCellFocus}
         onBlur={manageBlur}
      >
         <div className={innerDivClassNames(cellHasFocus)}  >
            <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} />
            {cellText(cell)}
         </div>
      </div>
   );
   // not adding an onFocus handler into the div as we are handling focus with the setTimeout
}

export default SubsheetCell;
