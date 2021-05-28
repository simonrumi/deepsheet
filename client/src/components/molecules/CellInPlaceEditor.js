import React, { useRef } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus } from '../../actions/focusActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { isSomething, ifThen } from '../../helpers';
import { tabToNextVisibleCell } from '../../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import {
   stateSheetId,
   cellText,
   cellRow,
   cellColumn,
   stateOriginalValue,
   stateOriginalRow,
   stateOriginalColumn
} from '../../helpers/dataStructureHelpers';
import IconNewDoc from '../atoms/IconNewDoc';
import IconClose from '../atoms/IconClose';
import CheckmarkSubmitIcon from '../atoms/IconCheckmarkSubmit';
import { DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '../../constants';

const reinstateOriginalValue = cell => ifThen({
   ifCond: cell.row === stateOriginalRow(managedStore.state) && cell.column === stateOriginalColumn(managedStore.state),
   thenDo: updatedCell,
   params: {
      thenParams: {
         ...cell,
         content: { ...cell.content, text: stateOriginalValue(managedStore.state) },
         isStale: false,
      }
   }
});

// TODO BUG
// 1. click on cell 1, 1
// 2. esc
// 3. click on cell 1, 3
// 4. tab
// result: notice that in console we see
// focusReducer got UPDATED_FOCUS for cell row 1 column 2 // incorrect
// then later
// focusReducer got UPDATED_FOCUS for cell row 1 column 4 // correct
// note that, related to the undoReducer, we have the maybePast which stores the focus of the cell. 
// perhaps maybePast should be updated to have no focused cell

const finalizeCellContent = (cell, cellInPlaceEditorRef) => {
   if (!R.equals(stateOriginalValue(managedStore.state), cellInPlaceEditorRef.current?.value)) {
      hasChangedCell({
         row: cellRow(cell),
         column: cellColumn(cell),
      });
   }
   // console.log('CellInPlaceEditor.finalizeCellContent got cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
   finishedEditing({
      value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
      message: 'edited row ' + cellRow(cell) + ', column ' + cellColumn(cell),
   });
}

const triggerCreatedSheetAction = cell => {
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

const handleSubmit = (event, cell, cellInPlaceEditorRef) => {
   // console.log('CellInPlaceEditor.handleSubmit cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
   event.preventDefault();
   finalizeCellContent(cell, cellInPlaceEditorRef);
   // cellInPlaceEditorRef.current.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   document.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   clearedFocus();
}

const handleCancel = (event, cell, cellInPlaceEditorRef) => {
   event.preventDefault();
   reinstateOriginalValue(cell); // note: this does the updatedCell call
   // cellInPlaceEditorRef.current.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   document.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   clearedFocus();
   // TODO NOTE: added the following in; test esc with key and with icon.
   finishedEditing({
      value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
      message: 'cancelled editing row ' + cellRow(cell) + ', column ' + cellColumn(cell),
   });
}

const keyBindings = (event, cell, cellInPlaceEditorRef) => {
   // use https://keycode.info/ to get key values
   switch(event.keyCode) {
       case 27: // esc
            handleCancel(event, cell, cellInPlaceEditorRef);
            break;
       case 13: // enter
            handleSubmit(event, cell, cellInPlaceEditorRef);
            break;
       case 9: // tab
            handleSubmit(event, cell, cellInPlaceEditorRef);
            manageBlur(event, cell, cellInPlaceEditorRef);
            tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
            break;
       default:
   }
};

const manageFocus = (event, cell, cellInPlaceEditorRef) => {
   event.preventDefault();
   // cellInPlaceEditorRef.current.addEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   console.log('CellInPlaceEditor.manageFocus got cell row', cell.row, 'column', cell.column);
   document.addEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   cellInPlaceEditorRef.current.selectionStart = 0;
   cellInPlaceEditorRef.current.selectionEnd = cellText(cell).length;
   startedEditing(cell);
}

const manageBlur = (event, cell, cellInPlaceEditorRef) => {
   event.preventDefault();
   finalizeCellContent(cell, cellInPlaceEditorRef);
   // cellInPlaceEditorRef.current.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   console.log('CellInPLaceEditor.manageBlur about to do document.removeEventListener for cell row', cell.row, 'column', cell.column);
   document.removeEventListener('keydown', evt => keyBindings(evt, cell, cellInPlaceEditorRef), false);
   clearedFocus();
   updatedCell(cell);
}

const manageChange = (event, cell) => {
   event.preventDefault();
   updatedCell({
      ...cell,
      content: { ...cell.content, text: event.target.value },
      isStale: true,
   });
}

const CellInPlaceEditor = ({ cell, positioning, cellHasFocus }) => {
   // this ref is applied to the text area (see below) so that we can manage its focus
   const cellInPlaceEditorRef = useRef(null);

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
               <IconNewDoc classes="mb-1" svgClasses="w-6" onMouseDownFn={() => triggerCreatedSheetAction(cell)} />
               <CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={event => handleSubmit(event, cell, cellInPlaceEditorRef)} />
               <IconClose classes="bg-white" svgClasses="w-6" onMouseDownFn={event => handleCancel(event, cell, cellInPlaceEditorRef)} />
            </div>
         </div>
      );
   };

   const renderTextForm = (editorRef, cell) => {
      // console.log('CellInPlaceEditor.renderTextForm got editorRef.current', editorRef.current);
      const textArea = (
         <form onSubmit={event => handleSubmit(event, cell, editorRef)} >
            {renderIcons()}
            <textarea
               className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
               ref={editorRef}
               rows="3"
               value={cellText(cell)}
               onChange={event => manageChange(event, cell)}
               onBlur={event => manageBlur(event, cell, editorRef)}
               onFocus={event => manageFocus(event, cell, editorRef)}
            />
         </form>
      );
      return textArea;
   };

   // need to do this setTimeout workaround so the cellInPlaceEditorRef can first be assigned to the textarea
   // then we set the focus on that text area 1 tick after. Replace this if a better way is found.
   window.setTimeout(() => {
      // console.log('CellInPlaceEditor, in the setTimeout, has cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
      if (cellHasFocus && isSomething(cellInPlaceEditorRef.current)) {
         cellInPlaceEditorRef.current.focus();
      }
   }, 0);

   // console.log('CellInPLaceEditor about to render, has cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
   return (
      <div style={positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm(cellInPlaceEditorRef, cell)}
      </div>
   );
}

export default CellInPlaceEditor; 
