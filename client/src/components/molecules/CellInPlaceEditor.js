import React, { useRef } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus } from '../../actions/focusActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { isSomething } from '../../helpers';
import { tabToNextVisibleCell } from '../../helpers/cellHelpers';
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

const CellInPlaceEditor = props => {
   const keyBindings = event => {
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
            handleCancel(event);
            break;
         case 13: // enter
            handleSubmit(event);
            break;
         case 9: // tab
            handleSubmit(event);
            tabToNextVisibleCell(props.cell.row, props.cell.column, event.shiftKey);
            break;
         default:
      }
   }

   const reinstateOriginalValue = () => {
      updatedCell({
         ...props.cell,
         content: { ...props.cell.content, text: stateOriginalValue(managedStore.state) },
         isStale: false,
      });
   }

   const manageFocus = event => {
      event.preventDefault();
      document.addEventListener('keydown', keyBindings, false);
      cellInPlaceEditorRef.current.selectionStart = 0;
      cellInPlaceEditorRef.current.selectionEnd = cellText(props.cell).length;
      startedEditing(cellText(props.cell));
   }

   const finalizeCellContent = () => {
      if (!R.equals(stateOriginalValue(managedStore.state), cellInPlaceEditorRef.current?.value)) {
         hasChangedCell({
            row: cellRow(props.cell),
            column: cellColumn(props.cell),
         });
      }
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: 'edited row ' + cellRow(props.cell) + ', column ' + cellColumn(props.cell),
      });
   }

   const manageBlur = event => {
      event.preventDefault();
      finalizeCellContent();
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
   }

   const manageChange = event => {
      event.preventDefault();
      updatedCell({
         ...props.cell,
         content: { ...props.cell.content, text: event.target.value },
         isStale: true,
      });
   }

   const triggerCreatedSheetAction = () => {
      const rows = DEFAULT_TOTAL_ROWS;
      const columns = DEFAULT_TOTAL_COLUMNS;
      const title = cellText(props.cell) || null;
      const parentSheetId = stateSheetId(managedStore.state);
      const summaryCell = { row: 0, column: 0 }; // this would be to tell which cell in the new sheet is the summary cell. Default is 0,0
      const parentSheetCell = props.cell;
      const rowHeights = createDefaultAxisSizing(DEFAULT_TOTAL_ROWS, DEFAULT_ROW_HEIGHT);
      const columnWidths = createDefaultAxisSizing(DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH);
      const { userId } = getUserInfoFromCookie();
      createdSheet({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell, rowHeights, columnWidths, userId });
   }

   const handleSubmit = event => {
      event.preventDefault();
      finalizeCellContent();
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
   }

   const handleCancel = event => {
      event.preventDefault();
      reinstateOriginalValue();
      document.removeEventListener('keydown', keyBindings, false);
      clearedFocus();
   }

   const renderIcons = () => {
      const leftPositioning = {
         left: props.positioning.width
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

   const renderTextForm = editorRef => {
      const textArea = (
         <form onSubmit={handleSubmit} >
            <textarea
               className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
               ref={editorRef}
               rows="3"
               value={cellText(props.cell)}
               onChange={manageChange}
               onFocus={manageFocus}
               onBlur={manageBlur}
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
      if (props.cellHasFocus && isSomething(cellInPlaceEditorRef.current)) {
         cellInPlaceEditorRef.current.focus();
      }
   }, 0);
   
   return (
      <div style={props.positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderIcons()}
         {renderTextForm(cellInPlaceEditorRef)}
      </div>
   );
}

export default CellInPlaceEditor; 
