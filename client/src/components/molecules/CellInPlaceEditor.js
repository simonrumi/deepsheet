import React, { useRef } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus, updatedFocusRef, updatedFocusAbortControl, focusedCell } from '../../actions/focusActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { isSomething, ifThen } from '../../helpers';
import { tabToNextVisibleCell, isStateCellRefThisCell } from '../../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import { manageFocus, manageTab } from '../../helpers/focusHelpers';
import {
   stateSheetId,
   cellText,
   cellRow,
   cellColumn,
   stateOriginalValue,
   stateOriginalRow,
   stateOriginalColumn,
   stateFocusCellRef,
   stateFocusCell,
   stateFocusAbortControl,
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
   const cellInPlaceEditorRef = useRef();
   console.log('CellInPlaceEditor got cellInPlaceEditorRef.current', cellInPlaceEditorRef?.current);

   const finalizeCellContent = (cell) => {
      console.log('CellInPlaceEditor.finalizeCellContent will test these for equality: stateOriginalValue(managedStore.state)', stateOriginalValue(managedStore.state), 'cellInPlaceEditorRef.current?.value', cellInPlaceEditorRef.current?.value)
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

   const handleTab = event => {
      // manageTab({ event, cell }) ? finalizeCellContent(cell, cellInPlaceEditorRef) : null;
      const tabbedAway = manageTab({ event, cell, callback: () => finalizeCellContent(cell, cellInPlaceEditorRef) });
      /* console.log('CellInPlaceEditor.handleTab called manageTab and got tabbedAway is', tabbedAway);
      if (tabbedAway) {
         finalizeCellContent(cell, cellInPlaceEditorRef);
      } */
   }

   const handleSubmit = event => {
      event.preventDefault();
      // console.log('CellInPlaceEditor.handleSubmit cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
      stateFocusAbortControl(managedStore.state).abort();
      finalizeCellContent(cell, cellInPlaceEditorRef);
      clearedFocus();
   }
   
   const handleCancel = event => {
      event.preventDefault();
      stateFocusAbortControl(managedStore.state).abort();
      // console.log('CellInPlaceEditor.handleCancel has aborted the event listener; now calling reinstateOriginalValue then finishedEditing with cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
      reinstateOriginalValue(cell); // note: this does the updatedCell call
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: 'cancelled editing row ' + cellRow(cell) + ', column ' + cellColumn(cell),
      });
      clearedFocus();
   }
   
   const keyBindingsCellInPlaceEditor = event => {
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
            handleCancel(event);
            break;
         case 13: // enter
            handleSubmit(event);
            break;
         case 9: // tab
            // console.log('*********TAB************ cellInPlaceEditorRef.current', cellInPlaceEditorRef.current)
            handleTab(event);
            break;
         default:
      }
   };
   
   const manageBlur = event => {
      event.preventDefault();
      // console.log('CellInPLaceEditor.manageBlur about to do abortControl.abort for cell row', cell.row, 'column', cell.column);
      stateFocusAbortControl(managedStore.state).abort();
      finalizeCellContent(cell);
      updatedFocusRef({ ref: null }); // clear the existing focusRef
      clearedFocus();
      updatedCell(cell); // TODO ...do we need this? we don't have it in SubsheetCell
   }

   const manageCellInPlaceEditorFocus = event => {
      ifThen({
         ifCond: manageFocus, // returns true if the focus needed to be updated
         thenDo: [
            () => cellInPlaceEditorRef.current.selectionStart = 0,
            () => cellInPlaceEditorRef.current.selectionEnd = cellText(cell).length,
            () => startedEditing(cell)
         ],
         params: { ifParams: { event, cell, cellRef: cellInPlaceEditorRef, keyBindings: keyBindingsCellInPlaceEditor } }
      });
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
               <IconNewDoc classes="mb-1" svgClasses="w-6" onMouseDownFn={() => triggerCreatedSheetAction(cell)} />
               <CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleSubmit} />
               <IconClose classes="bg-white" svgClasses="w-6" onMouseDownFn={handleCancel} />
            </div>
         </div>
      );
   };

   const renderTextForm = () => {
      const textArea = (
         <form onSubmit={handleSubmit} >
            {renderIcons()}
            <textarea
               className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
               ref={cellInPlaceEditorRef}
               rows="3"
               value={cellText(cell)}
               onChange={evt => manageChange(evt, cell)}
               onBlur={manageBlur}
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
         manageCellInPlaceEditorFocus(null);
      }
   }, 0);

   // console.log('CellInPLaceEditor about to render, has cellInPlaceEditorRef.current', cellInPlaceEditorRef.current);
   return (
      <div style={positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm()}
      </div>
   );
}

export default CellInPlaceEditor; 
