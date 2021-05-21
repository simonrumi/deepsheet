import React from 'react';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { tabToNextVisibleCell } from '../../helpers/cellHelpers';
import { cellText } from '../../helpers/dataStructureHelpers';

const onCellClick = cell => {
   console.log('SummaryCell.onCellClick about to call focusedCell() for cell row', cell.row, 'cell.column', cell.column);
   focusedCell(cell);
   hidePopups();
}

const keyBindings = (event, cell) => {
   // use https://keycode.info/ to get key values
   switch(event.keyCode) {
      case 27: // esc
         document.removeEventListener('keydown', evt => keyBindings(evt, cell), false);
         clearedFocus();
         break;
      case 9: // tab
         tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
         break;
      default:
   }
}

const SummaryCell = React.memo(({ cell, cellHasFocus }) => {
   const renderSummaryCell = () => {
      cellHasFocus 
         ? document.addEventListener('keydown', evt => keyBindings(evt, cell), false) 
         : document.removeEventListener('keydown', evt => keyBindings(evt, cell), false);
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={() => onCellClick(cell)}>
            <div className="m-px p-px border border-pale-purple">
               {cellText(cell)}
            </div>
         </div>
      );
   }
   return renderSummaryCell();
});

export default SummaryCell;