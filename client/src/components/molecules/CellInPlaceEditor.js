import React, { useRef } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus } from '../../actions/focusActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { isSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { stateSheetId, cellText, cellRow, cellColumn, stateOriginalValue } from '../../helpers/dataStructureHelpers';
import IconNewDoc from '../atoms/IconNewDoc';

// TODO NEXT 
//  - 'esc' should allow you to exit without saving changes !
// ...THEN work on contorlling resizing of grid

const CellInPlaceEditor = props => {
   const keyBindings = event => {
      // esc
      if (event.keyCode === 27) {
         manageBlur(event);
         clearedFocus();
      }
   }

   const manageFocus = event => {
      event.preventDefault();
      document.addEventListener('keydown', keyBindings, false);
      cellInPlaceEditorRef.current.selectionStart = 0;
      cellInPlaceEditorRef.current.selectionEnd = cellText(props.cell).length;
      startedEditing(cellText(props.cell));
   }

   const manageBlur = event => {
      event.preventDefault();
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
      const rows = null;
      const columns = null;
      const title = null;
      const parentSheetId = stateSheetId(managedStore.state);
      const summaryCell = { row: 0, column: 0 }; // this would be to tell which cell in the new sheet is the summary cell. Default is 0,0
      const parentSheetCell = props.cell;
      const { userId } = getUserInfoFromCookie();
      createdSheet({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell, userId });
   }

   const renderIconNewDoc = () => {
      return (
         <div className="relative w-full">
            <div className="absolute bottom-4 left-0 z-10 w-8 flex justify-start">
               {/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
               Since the textarea has the focus, clicking on IconNewDoc will cause
               the editor's onBlur to fire...but we need to call another action before the onBlur,
               hence the use of onMouseDown */}
               <IconNewDoc classes="w-6 bg-white flex-1" onMouseDownFn={triggerCreatedSheetAction} />
            </div>
         </div>
      );
   };

   // need to do this setTimeout workaround so the cellInPlaceEditorRef can first be assigned to the textarea
   // then we set the focus on that text area 1 tick after. Replace this if a better way is found.
   window.setTimeout(() => {
      if (props.cellHasFocus && isSomething(cellInPlaceEditorRef.current)) {
         cellInPlaceEditorRef.current.focus();
      }
   }, 0);
   
   const renderTextArea = editorRef => {
      const textArea = (
         <textarea
            className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg"
            ref={editorRef}
            rows="3"
            value={cellText(props.cell)}
            onChange={manageChange}
            onFocus={manageFocus}
            onBlur={manageBlur}
         />
      );
      return textArea;
   };

   const cellInPlaceEditorRef = useRef(null);

   return (
      <div style={props.positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderIconNewDoc()}
         {renderTextArea(cellInPlaceEditorRef)}
      </div>
   );
}

export default CellInPlaceEditor; 
