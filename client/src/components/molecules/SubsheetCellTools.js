import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { loadSheet } from '../../services/sheetServices';
import { deleteSubsheetId } from '../../actions/cellActions';
import { clearedFocus } from '../../actions/focusActions';
import { cellIsCallingDb } from '../../helpers/dataStructureHelpers';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import IconDownToSubsheet from '../atoms/IconDownToSubsheet';
import IconUnlinkSubsheet from '../atoms/IconUnlinkSubsheet';
import IconLoading from '../atoms/IconLoading';
import { DEFAULT_COLUMN_WIDTH } from '../../constants';

import {
   cellColumn,
   cellRow,
   cellText,
   stateSheetId,
   cellSubsheetId,
   stateColumnWidths
} from '../../helpers/dataStructureHelpers';

const SubsheetCellTools = props => {
   const { cell, cellHasFocus } = props;
   const columnWidths = useSelector(state => stateColumnWidths(state));
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
   const parentClasses = 'absolute top-0 z-10 flex flex-col border border-grey-blue p-1 bg-white';

   const renderIcons = () => {
      const widthObj = getObjectFromArrayByKeyValue('index', cell.column, columnWidths);

      const leftPositioning = {
         left: widthObj?.size || DEFAULT_COLUMN_WIDTH
      }
      if (cellIsCallingDb(cell)) {
         return (
            <div className="relative">
               <div className={parentClasses} style={leftPositioning}>
                  <IconLoading classes="w-6 flex-1" />
               </div>
            </div>
         );
      }
      if (cellHasFocus) {
         return (
            <div className="relative" >
               <div className={parentClasses} style={leftPositioning}>
                  <IconDownToSubsheet
                     classes="w-6 flex-1 mb-1"
                     onMouseDownFn={() => {
                        loadSheet(managedStore.state, subsheetId);
                     }}
                  />
                  <IconUnlinkSubsheet classes="w-6 flex-1" onMouseDownFn={unlinkSubsheet} />
               </div>
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