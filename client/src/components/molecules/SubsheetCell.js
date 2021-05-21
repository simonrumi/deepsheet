import React, { useMemo, useRef, useState } from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { ifThenElse, spicyCurry } from '../../helpers';
import { cellText } from '../../helpers/dataStructureHelpers';
import { isCellFocused, tabToNextVisibleCell } from '../../helpers/cellHelpers';
import SubsheetCellTools from './SubsheetCellTools';

// TODO BUG
// tab from regular cell to subshet cell
// try to tab from subsheet cell to rgular cell
// result: focus stays on subsheet cell
// also: lots and lots of cell rendering going on
// ...note that we took useMemo out of this
// also maybe took it out of Cell
// ....so maybereinstate
// maybe handling of keybindings should be done at Cells.js level, not at individual cell level
// perhaps cellRef could be stored in store and continuously updated
//
// see this discussion on preventing children getting re-rendered
// https://spectrum.chat/react/help/updating-child-without-re-rendering-parent-in-react-hooks~abac18dc-019f-4954-8c3b-7ac8be672567
// they suggest useRef & useCallback and refer to https://overreacted.io/a-complete-guide-to-useeffect

const handleBlur = (event, cell, cellRef) => {
   event.preventDefault();
   // cellRef.current.removeEventListener('keydown', evt => keyBindings(evt, cell, cellRef), false);
   document.removeEventListener('keydown', evt => keyBindings(evt, cell, cellRef), false);
   clearedFocus();
}

const keyBindings = (event, cell, cellRef) => {
   // console.log('SubsheetCell.keyBindings got cellRef.current', cellRef.current, 'event.keyCode', event.keyCode);
   // use https://keycode.info/ to get key values
   // TODO apparently should be using event.key instead, but it returns values like "Enter" and "Tab" so need to handle both
   switch(event.keyCode) {
      case 27: // esc
         handleBlur(event, cell, cellRef);
         break;
      case 9: // tab
         handleBlur(event, cell, cellRef);
         tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
         break;
      default:
   }
};

const onCellClick = (event, cell, cellRef) => {
   event.preventDefault();
   console.log('SubsheetCell.onCellClick about to call focusedCell() for cell row', cell.row, 'cell.column', cell.column);
   focusedCell(cell);
   hidePopups();
   // console.log('SubsheeetCell.onCellClick got cellRef', cellRef); 
   cellRef.current.focus();
   // manageFocus(true, cell, cellRef);
   // cellRef.current.addEventListener('keydown', evt => keyBindings(evt, cell, cellRef), false);
   document.addEventListener('keydown', evt => keyBindings(evt, cell, cellRef), false);
}

const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
   return cellBaseClasses + borderClasses;
};

/*
// TODO have tried various setTimeout things....seem to have got the right one
// BUT currently the keyBindings is not being called
const manageFocus = (cellHasFocus, cell, cellRef) => {
   console.log('SubsheetCell.manageFocus got cellRef', cellRef, 'cellHasFocus', cellHasFocus);
   if (cellHasFocus) {
      // cellRef.current.focus();
      console.log('SubsheetCell.manageFocus about to addEventListener to cellRef.current', cellRef.current);
      cellRef.current.addEventListener('keydown', evt => keyBindings(cell, cellRef, evt), false)
   }

    ifThenElse({
      ifCond: cellHasFocus && !haveKeyBindings,
      thenDo: (type,func,useCapture) => {
         console.log('SubsheetCell.manageFocus adding event listener to cellRef.current', cellRef.current);
         cellRef.current.addEventListener(type,func,useCapture, false);
         setHaveKeyBindings(true);
      }, // for some reason .addEventListener() needs to be wrapped in a function
      elseDo: (type,func,useCapture) => {
         cellRef.current.removeEventListener(type,func,useCapture)
      },
      /* thenDo: (type,func,useCapture) => window.setTimeout(cellRef.current?.addEventListener(type,func,useCapture), 0),
      elseDo: (type,func,useCapture) => window.setTimeout(cellRef.current?.removeEventListener(type,func,useCapture), 0),  // TODO get rid of if not needed*/
      /*params: {
         thenParams: ['keydown', evt => keyBindings(cell, cellRef, evt), false],
         elseParams: ['keydown', evt => keyBindings(cell, cellRef, evt), false]
      }
   }); 
}*/

const SubsheetCell = ({ cell }) => {
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));
   const cellRef = useRef(null);
   // window.setTimeout(() => manageFocus(cellHasFocus, cell, cellRef), 0); // setTimeout is to make sure that the cellRef has got a value before calling manageFocus

   // TODO reinstate useMemo once keyBindings work
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

   // return renderedSubsheetCell;
}

export default SubsheetCell;
