import React from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { loadSheet } from '../../services/sheetServices';
import { deleteSubsheetId } from '../../actions/cellActions';
import { clearedFocus } from '../../actions/focusActions';
import { cellIsCallingDb } from '../../helpers/dataStructureHelpers';
import IconDownToSubsheet from '../atoms/IconDownToSubsheet';
import IconUnlinkSubsheet from '../atoms/IconUnlinkSubsheet';
import IconLoading from '../atoms/IconLoading';

import {
   cellColumn,
   cellRow,
   cellText,
   stateSheetId,
   cellSubsheetId,
} from '../../helpers/dataStructureHelpers';

const SubsheetCellTools = props => {
   const { cell, cellHasFocus } = props;
   const subsheetId = cellSubsheetId(cell);

   const unlinkSubsheet = async () => {
      const row = cellRow(cell);
      const column = cellColumn(cell);
      const text = cellText(cell);
      await R.pipe(
         stateSheetId, 
         deleteSubsheetId(row, column, text, subsheetId)
      )(managedStore.state);
      clearedFocus();
   }
   const parentClasses = 'absolute bottom-0 left-0 z-10 w-full flex justify-start border border-grey-blue p-1 bg-white'

   const renderIcons = () => {
      if (cellIsCallingDb(cell)) {
         return <div className={parentClasses}><IconLoading classes="w-6 flex-1" /></div>;
      }
      if (cellHasFocus) {
         return (
            <div className={parentClasses}>
               <IconDownToSubsheet
                  classes="w-6 flex-1 mr-2"
                  onMouseDownFn={() => {
                     loadSheet(managedStore.state, subsheetId);
                  }}
               />
               <IconUnlinkSubsheet classes="w-6 flex-1" onMouseDownFn={unlinkSubsheet} />
            </div>
         );
         /* Note that onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         * this used to be critical when the editor was separated from the cell. Might not be now, but using
         * onMouseDown is not hurting */
      }
      return null;
   }
   return  renderIcons();
}

export default SubsheetCellTools;