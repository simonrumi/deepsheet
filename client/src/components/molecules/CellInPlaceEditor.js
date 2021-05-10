import React, { useRef, useEffect } from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus } from '../../actions/focusActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { isSomething } from '../../helpers';
import { tabToNextVisibleCell, createCellKey, getCellsFromCellKeys } from '../../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import {
   stateSheetId,
   cellText,
   cellRow,
   cellColumn,
   stateOriginalValue,
} from '../../helpers/dataStructureHelpers';
import IconNewDoc from '../atoms/IconNewDoc';
import IconClose from '../atoms/IconClose';
import CheckmarkSubmitIcon from '../atoms/IconCheckmarkSubmit';
import { DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '../../constants';

const CellInPlaceEditor = ({ cell, positioning, cellHasFocus }) => {
   // the store's state is the source of truth for the cell's content, the cell value received as a prop seems not always in sync with that
   // TODO test using cell instead of stateCell - maybe stateCEll is not needed
   const stateCell = useSelector(state =>  R.pipe(
         createCellKey,
         R.append(R.__, []),
         getCellsFromCellKeys(managedStore.state),
         R.head
      )(cell.row, cell.column)
   );

   const keyBindings = event => {
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
            handleCancel(event);
            break;
         case 13: // enter
            handleSubmit(event, stateCell);
            break;
         case 9: // tab
            handleSubmit(event);
            tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
            break;
         default:
      }
   }

   const reinstateOriginalValue = () => {
      updatedCell({
         ...cell,
         content: { ...cell.content, text: stateOriginalValue(managedStore.state) },
         isStale: false,
      });
   }

   const manageFocus = event => {
      event.preventDefault();
      document.addEventListener('keydown', keyBindings, false);
      cellInPlaceEditorRef.current.selectionStart = 0;
      cellInPlaceEditorRef.current.selectionEnd = cellText(cell).length;
      startedEditing(cellText(cell));
   }

   const finalizeCellContent = () => {
      if (!R.equals(stateOriginalValue(managedStore.state), cellInPlaceEditorRef.current?.value)) {
         hasChangedCell({
            row: cellRow(cell),
            column: cellColumn(cell),
         });
      }
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: 'edited row ' + cellRow(cell) + ', column ' + cellColumn(cell),
      });
   }

   const manageBlur = event => {
      event.preventDefault();
      finalizeCellContent();
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
      updatedCell(cell);
   }

   const manageChange = event => {
      event.preventDefault();
      updatedCell({
         ...cell,
         content: { ...cell.content, text: event.target.value },
         isStale: true,
      });
   }

   const triggerCreatedSheetAction = () => {
      const rows = DEFAULT_TOTAL_ROWS;
      const columns = DEFAULT_TOTAL_COLUMNS;
      const title = cellText(cell) || null;
      const parentSheetId = stateSheetId(managedStore.state);
      const summaryCell = { row: 0, column: 0 }; // this would be to tell which cell in the new sheet is the summary cell. Default is 0,0
      const parentSheetCell = cell;
      const rowHeights = createDefaultAxisSizing(DEFAULT_TOTAL_ROWS, DEFAULT_ROW_HEIGHT);
      const columnWidths = createDefaultAxisSizing(DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH);
      const { userId } = getUserInfoFromCookie();
      createdSheet({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell, rowHeights, columnWidths, userId });
   }

   const handleSubmit = (event, cell) => {
      event.preventDefault();
      finalizeCellContent();
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
   }

   const handleCancel = event => {
      event.preventDefault();
      reinstateOriginalValue(); // note: this does the updatedCell call
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
   }

   const renderIcons = () => {
      const leftPositioning = {
         left: positioning.width
      }
      return (
         <div className="relative w-full">
            <div className="absolute top-0 z-10 flex flex-col bg-white border border-grey-blue p-1" style={leftPositioning}>
               {/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
               Since the textarea has the focus, clicking on IconNewDoc will cause
               the editor's onBlur to fire...but we need to call another action before the onBlur,
               hence the use of onMouseDown */}
               <IconNewDoc classes="mb-1" svgClasses="w-6" onMouseDownFn={triggerCreatedSheetAction} />
               <CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleSubmit} />
               <IconClose classes="bg-white" svgClasses="w-6" onMouseDownFn={handleCancel} />
            </div>
         </div>
      );
   };

   const renderTextForm = (editorRef, cell) => {
      const textArea = (
         <form onSubmit={event => handleSubmit(event, cell)} >
            {renderIcons()}
            <textarea
               className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
               ref={editorRef}
               rows="3"
               value={cellText(cell)}
               onChange={manageChange}
               onBlur={manageBlur}
               onFocus={manageFocus}
            />
         </form>
      );
      return textArea;
   };

   // this ref is applied to the text area (see above) so that we can manage its focus
   const cellInPlaceEditorRef = useRef(null);

   // need to do this setTimeout workaround so the cellInPlaceEditorRef can first be assigned to the textarea
   // then we set the focus on that text area 1 tick after. Replace this if a better way is found.
   window.setTimeout(() => {
      if (cellHasFocus && isSomething(cellInPlaceEditorRef.current)) {
         cellInPlaceEditorRef.current.focus();
      }
   }, 0);

   return (
      <div style={positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm(cellInPlaceEditorRef, stateCell)}
      </div>
   );
}

export default CellInPlaceEditor; 
