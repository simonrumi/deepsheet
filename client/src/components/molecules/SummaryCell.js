import React from 'react';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { tabToNextVisibleCell } from '../../helpers/cellHelpers';
import { cellText } from '../../helpers/dataStructureHelpers';

const SummaryCell = React.memo(({ cell, cellHasFocus }) => {
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

   const onCellClick = () => {
      focusedCell(cell);
      hidePopups();
   }

   const renderSummaryCell = () => {
      cellHasFocus ? document.addEventListener('keydown', keyBindings, false) : document.removeEventListener('keydown', keyBindings, false);
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={onCellClick}>
            <div className="m-px p-px border border-pale-purple">
               {cellText(cell)}
            </div>
         </div>
      );
   }

   return renderSummaryCell();
});

export default SummaryCell;