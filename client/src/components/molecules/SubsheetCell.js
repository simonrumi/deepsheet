import React from 'react';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import { cellText } from '../../helpers/dataStructureHelpers';
import { isCellFocused, tabToNextVisibleCell } from '../../helpers/cellHelpers';
import SubsheetCellTools from './SubsheetCellTools';
import managedStore from '../../store';

const SubsheetCell = props => {
   const { cell } = props;

   const keyBindings = event => {
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
            document.removeEventListener('keydown', keyBindings, false);
            clearedFocus();
            break;
         case 9: // tab
            tabToNextVisibleCell(props.cell.row, props.cell.column, event.shiftKey);
            break;
         default:
      }
   }

   const renderIcons = cellHasFocus => {
      return (
         <div className="relative w-full">
            <div className="absolute bottom-4 left-0 z-10 min-w-full flex justify-start">
               <SubsheetCellTools cell={cell} cellHasFocus={cellHasFocus} />
            </div>
         </div>
      );
   }

   const onCellClick = evt => {
      evt.preventDefault();
      focusedCell(cell);
      hidePopups();
   }

   const innerDivClassNames = cellHasFocus => {
      const cellBaseClasses = 'm-px p-px ';
      const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
      return cellBaseClasses + borderClasses;
   };

   const renderSubsheetCell = () => {
      const cellHasFocus = isCellFocused(cell, managedStore.state);
      cellHasFocus ? document.addEventListener('keydown', keyBindings, false) : document.removeEventListener('keydown', keyBindings, false);
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={evt => onCellClick(evt)}>
            <div className={innerDivClassNames(cellHasFocus)}>
               {renderIcons(cellHasFocus)}
               {cellText(cell)}
            </div>
         </div>
      );
      // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
      // while these classes create a 1x1 grid that takes up the full space within that:
      // grid items-stretch
      // In the inner div there is the text, with m-px giving a 1px margin so its orange border is a little separated from the outer div's grey border
   };

   // Note that we're not using redux's useSelector() hook in here, 
   // instead we're relying having this component re-rendered whenever the parent Cell component is rerendered
   return renderSubsheetCell();
}

export default SubsheetCell;
