import React from 'react';
import * as R from 'ramda';
import { loadSheet } from '../../services/sheetServices';
import { menuHidden } from '../../actions/menuActions';
import { deleteSubsheetId } from '../../actions/cellActions';
import { focusedCell, clearedFocus } from '../../actions/focusActions';
import {
   cellColumn,
   cellRow,
   cellText,
   cellIsCallingDb,
   stateSheetId,
   cellSubsheetId,
} from '../../helpers/dataStructureHelpers';
import { isCellFocused } from '../../helpers/cellHelpers';
import IconDownToSubsheet from '../atoms/IconDownToSubsheet';
import IconUnlinkSubsheet from '../atoms/IconUnlinkSubsheet';
import IconLoading from '../atoms/IconLoading';
import managedStore from '../../store';

const SubsheetCell = props => {
   const subsheetId = cellSubsheetId(props.cell);

   const unlinkSubsheet = async () => {
      const row = cellRow(props.cell);
      const column = cellColumn(props.cell);
      const text = cellText(props.cell);
      await R.pipe(
         stateSheetId, 
         deleteSubsheetId(row, column, text, subsheetId)
      )(managedStore.state);
      clearedFocus();
   }

   const renderIconUnlinkSubsheet = () => {
      /* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         Since the Editor may have the focus when a cell is clicked, clicking on IconNewDoc will cause
         the Editor's onBlur to fire...but we need to call another action before the onBlur,
         hence the use of onMouseDown */
      return <IconUnlinkSubsheet classes="w-4 flex-1" onMouseDownFn={unlinkSubsheet} />;
   }

   const renderIconDownToSubsheet = () => {
      /* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         Since the Editor may have the focus when a cell is clicked, clicking on IconNewDoc will cause
         the Editor's onBlur to fire...but we need to call another action before the onBlur,
         hence the use of onMouseDown */
      return (
         <IconDownToSubsheet
            classes="w-4 flex-1 mr-2"
            onMouseDownFn={() => {
               loadSheet(managedStore.state, subsheetId);
            }}
         />
      );
   }

   const renderIcons = cellHasFocus => {
      if (cellIsCallingDb(props.cell)) {
         return (
            <div className="relative w-full">
               <div className="absolute bottom-4 left-0 z-10 min-w-full flex justify-start">
                  <IconLoading classes="w-4 flex-1" />
               </div>
            </div>
         );
      }
      if (cellHasFocus) {
         return (
            <div className="relative w-full">
               <div className="absolute bottom-4 left-0 z-10 min-w-full flex justify-start">
                  {renderIconDownToSubsheet()}
                  {renderIconUnlinkSubsheet()}
               </div>
            </div>
         );
      }
      return null;
   }

   const onCellClick = evt => {
      evt.preventDefault();
      focusedCell(props.cell);
      menuHidden(); // in case the menu was showing, hide it
   }

   const innerDivClassNames = cellHasFocus => {
      const cellBaseClasses = 'm-px p-px ';
      const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-pale-yellow';
      return cellBaseClasses + borderClasses;
   };

   const renderSubsheetCell = () => {
      const cellHasFocus = isCellFocused(props.cell, managedStore.state);
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={evt => onCellClick(evt)}>
            <div className={innerDivClassNames(cellHasFocus)}>
               {renderIcons(cellHasFocus)}
               {cellText(props.cell)}
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
