import React, { useMemo } from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { ifThenElse } from '../../helpers';
import { cellText } from '../../helpers/dataStructureHelpers';
import { isCellFocused, tabToNextVisibleCell } from '../../helpers/cellHelpers';
import SubsheetCellTools from './SubsheetCellTools';

const onCellClick = (evt, cell) => {
   evt.preventDefault();
   focusedCell(cell);
   hidePopups();
}

const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
   return cellBaseClasses + borderClasses;
};

const keyBindings = R.curry((cell, event) => {
   // use https://keycode.info/ to get key values
   switch(event.keyCode) {
      case 27: // esc
         document.removeEventListener('keydown', keyBindings, false);
         clearedFocus();
         break;
      case 9: // tab
         tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
         break;
      default:
   }
});

const manageFocus = (cellHasFocus, cell) => {
   ifThenElse({
      ifCond: cellHasFocus,
      thenDo: (type,func,useCapture) => document.addEventListener(type,func,useCapture), // for some reason document.addEventListener needs to be wrapped in a function
      elseDo: (type,func,useCapture) => document.removeEventListener(type,func,useCapture),
      params: {
         thenParams: ['keydown', keyBindings(cell), false],
         elseParams: ['keydown', keyBindings(cell), false]
      }
   });
}

const SubsheetCell = ({ cell }) => {
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));

   // using useMemo() here instead of React.memo because we need to rerender based on the dependencies cell & cellHasFocus. The latter isn't a prop, so can't use React.memo
   const renderedSubsheetCell = useMemo(() => {
      manageFocus(cellHasFocus, cell);
      // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
      // while these classes create a 1x1 grid that takes up the full space within that:
      // grid items-stretch
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={evt => onCellClick(evt, cell)}
         >
            <div className={innerDivClassNames(cellHasFocus)} >
               <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} />
               {cellText(cell)}
            </div>
         </div>
      );
      // In the inner div there is the text, with p-px giving a 1px padding so its orange border is a little separated from the outer div's grey border
   },
   [cell, cellHasFocus]
);

   return renderedSubsheetCell;
}

export default SubsheetCell;
