import React from 'react';
import { useSelector } from 'react-redux';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { cellText } from '../../helpers/dataStructureHelpers';
import { isCellFocused, tabToNextVisibleCell } from '../../helpers/cellHelpers';
import SubsheetCellTools from './SubsheetCellTools';

const SubsheetCell = props => {
   const { cell } = props;
   const cellHasFocus = useSelector(state => isCellFocused(props.cell, state));

   const keyBindings = event => {
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
   }

   const onCellClick = evt => {
      evt.preventDefault();
      focusedCell(cell);
      hidePopups();
   }

   const manageFocus = () => {
      if (cellHasFocus) {
         document.addEventListener('keydown', keyBindings, false);
         return;
      } 
      document.removeEventListener('keydown', keyBindings, false);
   }

   const innerDivClassNames = cellHasFocus => {
      const cellBaseClasses = 'p-px ';
      const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
      return cellBaseClasses + borderClasses;
   };

   const render = () => {
      manageFocus();
      // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
      // while these classes create a 1x1 grid that takes up the full space within that:
      // grid items-stretch
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={onCellClick}
            /* ref={cellRef} */
         >
            <div className={innerDivClassNames(cellHasFocus)} >
               <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} /* widths={columnWidths} *//>
               {cellText(cell)}
            </div>
         </div>
      );
      
      // In the inner div there is the text, with p-px giving a 1px padding so its orange border is a little separated from the outer div's grey border
   };

   return render();
}

export default SubsheetCell;
