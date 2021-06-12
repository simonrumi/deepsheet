import React, { useMemo, useRef, useState } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { useSelector } from 'react-redux';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus, updatedFocusRef, updatedFocusAbortControl } from '../../actions/focusActions';
import { ifThenElse, spicyCurry, isSomething, ifThen } from '../../helpers';
import { cellText, stateFocusAbortControl, stateFocusCell, stateFocusCellRef } from '../../helpers/dataStructureHelpers';
import { isCellFocused, tabToNextVisibleCell } from '../../helpers/cellHelpers';
import { manageFocus, manageTab } from '../../helpers/focusHelpers';
import SubsheetCellTools from './SubsheetCellTools';  

// NOTE
// see this discussion on preventing children getting re-rendered
// https://spectrum.chat/react/help/updating-child-without-re-rendering-parent-in-react-hooks~abac18dc-019f-4954-8c3b-7ac8be672567
// they suggest useRef & useCallback and refer to https://overreacted.io/a-complete-guide-to-useeffect


const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
   return cellBaseClasses + borderClasses;
};

const SubsheetCell = ({ cell, cellHasFocus }) => {
   const cellRef = useRef();
   console.log('SubsheetCell got cellRef.current', cellRef?.current, 'cellHasFocus', cellHasFocus);
   
   const keyBindingsSubsheetCell = event => {
      // use https://keycode.info/ to get key values
      // TODO apparently should be using event.key instead, but it returns values like "Enter" and "Tab" so need to handle both
      switch(event.keyCode) {
         case 27: // esc
            manageBlur(event);
            break;
         case 9: // tab
            console.log('********************** TAB ********************');
            manageTab({ event, cell });
            break;
         default:
      }
   };

   const manageBlur = event => {
      event.preventDefault();
      console.log('SubsheetCell.manageBlur for cellRef.current', cellRef.current, 'stateFocusAbortControl(managedStore.state)', stateFocusAbortControl(managedStore.state));
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

   // TODO reinstate useMemo once keyBindingsSubsheetCell work
   // BUT makesure this is up to date.....compared it to the un-memoized version
   /* // using useMemo() here instead of React.memo because we need to rerender based on the dependencies cell & cellHasFocus. The latter isn't a prop, so can't use React.memo
   const renderedSubsheetCell = useMemo(() => {
      
         // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
         // while these classes create a 1x1 grid that takes up the full space within that:
         // grid items-stretch
         return (
            <div
               className="grid-item grid items-stretch cursor-pointer border-t border-l"
               onClick={evt => onCellClick(evt, cell, cellRef)}
               ref={cellRef}
            >
               <div className={innerDivClassNames(cellHasFocus)}  >
                  <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} />
                  {cellText(cell)}
               </div>
            </div>
         );
         // In the inner div there is the text, with p-px giving a 1px padding so its orange border is a little separated from the outer div's grey border
      },
      [cell, cellHasFocus, cellRef]
   );
 */

   // need to do this setTimeout workaround so the cellRef can first be assigned to the div
   // then we set the focus on that div 1 tick after. Replace this if a better way is found.
   window.setTimeout(() => {
      console.log('SubsheetCell.setTimeout might set focus depending on cellHasFocus', cellHasFocus, 'and cellRef.current', cellRef.current);
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

   // return renderedSubsheetCell;
}

export default SubsheetCell;
